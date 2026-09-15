/* Validates source provenance and writes static, section-scoped stills into dist. */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto'), assert = require('assert/strict');
const root = path.resolve(__dirname, '..');
const manifestPath = 'assets/application-details-20260915.json';
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const sections = { showroom: 'showroom-plan', exterior: 'groundfloor-site-plan', workshop: 'workshop-plan' };
function dimensions(bytes, filename) {
  if (filename.endsWith('.png')) {
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG', 'Invalid PNG: ' + filename);
    return [bytes.readUInt32BE(16), bytes.readUInt32BE(20)];
  }
  if (/\.jpe?g$/.test(filename)) {
    assert.equal(bytes.readUInt16BE(0), 0xffd8, 'Invalid JPEG: ' + filename);
    let offset = 2;
    while (offset + 8 < bytes.length) {
      assert.equal(bytes[offset], 0xff, 'Invalid JPEG segment: ' + filename);
      while (bytes[offset] === 0xff) offset++;
      const marker = bytes[offset++];
      if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) return [bytes.readUInt16BE(offset + 5), bytes.readUInt16BE(offset + 3)];
      if (marker === 0xda || marker === 0xd9) break;
      offset += bytes.readUInt16BE(offset);
    }
    throw Error('JPEG dimensions missing: ' + filename);
  }
  return null;
}
function asset(record) {
  assert(record && typeof record.path === 'string', 'Asset path required');
  assert(/^assets\/application-details\/[a-z0-9-]+\.(png|jpg|jpeg|svg)$/.test(record.path), 'Unexpected asset path: ' + record.path);
  const bytes = fs.readFileSync(path.join(root, record.path));
  assert.equal(sha(bytes), record.sha256, 'Asset checksum mismatch: ' + record.path);
  assert(Number.isInteger(record.width) && record.width > 0 && Number.isInteger(record.height) && record.height > 0, 'Native dimensions required');
  const native = dimensions(bytes, record.path);
  if (native) assert.deepEqual(native, [record.width, record.height], 'Incorrect native dimensions: ' + record.path);
  return record;
}
function run() {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, manifestPath), 'utf8'));
  assert.equal(manifest.schema, 1); assert.equal(manifest.experienceRevision, 'v11');
  assert.equal(manifest.geometryRevision, 'v09-r9'); assert(Array.isArray(manifest.items));
  assert.deepEqual(manifest.items.map(item=>item.id).sort(), ['smart-care-position','smart-front-parking','smart-me-station','smart-rear-parking','smart-type4-detail'], 'Exactly five reviewed detail views required');
  new (require('vm').Script)(fs.readFileSync(path.join(root, 'application-details.js'), 'utf8'), {filename:'application-details.js'});
  for (const source of manifest.provenance || []) {
    assert(/^assets\/application-details\/[a-z0-9-]+\.json$/.test(source.path), 'Unexpected provenance path');
    assert.equal(sha(fs.readFileSync(path.join(root, source.path))), source.sha256, 'Source provenance mismatch');
  }
  const ids = new Set();
  for (const item of manifest.items) {
    assert(/^[a-z0-9-]+$/.test(item.id) && !ids.has(item.id), 'Unique detail ID required'); ids.add(item.id);
    assert(Object.hasOwn(sections, item.section), 'Known section required');
    assert.equal(item.acceptanceStatus, 'accepted-by-root', item.id + ': final review required');
    assert(['artist-impression', 'layout-drawing', 'model-reference'].includes(item.kind), 'Known visual kind required');
    for (const key of ['title', 'caption', 'note', 'alt']) assert(typeof item[key] === 'string' && item[key].trim(), item.id + ': ' + key + ' required');
    assert.equal(item.geometryRevision, manifest.geometryRevision, item.id + ': geometry review mismatch');
    assert(Array.isArray(item.sources) && item.sources.length, item.id + ': evidence sources required');
    assert(Array.isArray(item.reviewNotes) && item.reviewNotes.length, item.id + ': visual review notes required');
    asset(item.preview); asset(item.master);
    assert.equal(item.nativeResolution, true); assert.equal(item.upscaled, false);
    assert.equal(item.generatedMasterSha256, item.master.sha256, item.id + ': native master provenance');
    assert.deepEqual([item.preview.width,item.preview.height], [item.master.width,item.master.height], item.id + ': native derivative dimensions');
    if (item.vector) asset(item.vector);
  }
  const groups = Object.keys(sections).map(section => ({ section, items: manifest.items.filter(item => item.section === section) })).filter(group => group.items.length);
  const shortcuts = groups.map(group => `<div data-detail-section="${group.section}" hidden><p>รายละเอียดประกอบการนำเสนอ</p><ul>${group.items.map(item => `<li><a href="#detail-${item.id}">${escape(item.title)}</a></li>`).join('')}</ul></div>`).join('');
  const label = { 'artist-impression': 'Artist impression', 'layout-drawing': 'Layout drawing', 'model-reference': 'ภาพอ้างอิงจากโมเดล' };
  const content = groups.map(group => `<div data-detail-section="${group.section}" hidden>${group.items.map(item => `<figure id="detail-${item.id}" class="application-detail">
<a class="application-detail-image" href="./${item.master.path}" target="_blank" rel="noopener" aria-label="${escape('เปิดภาพขยาย: ' + item.title)}"><img src="./${item.preview.path}" alt="${escape(item.alt)}" width="${item.preview.width}" height="${item.preview.height}" loading="lazy" decoding="async"></a>
<p class="application-detail-image-error" hidden>แสดงภาพตัวอย่างไม่ได้ กรุณาใช้ลิงก์เปิดภาพขยายหรือดาวน์โหลดด้านล่าง</p>
<figcaption><h3>${escape(item.title)}</h3><p class="application-detail-caption">${escape(item.caption)}</p><p class="application-detail-status">${escape(label[item.kind] + ' · ' + item.note)}</p>
<div class="application-detail-actions"><a href="./${item.master.path}" target="_blank" rel="noopener">เปิดภาพขยาย</a><a href="./${item.master.path}" download>ดาวน์โหลดภาพ · ${item.master.width.toLocaleString('en-US')} × ${item.master.height.toLocaleString('en-US')} px</a>${item.vector ? `<a href="./${item.vector.path}" download>ดาวน์โหลดแบบเวกเตอร์ · SVG</a>` : ''}<button type="button" data-detail-plan="${sections[item.section]}">เปิดผังอ้างอิง</button></div></figcaption></figure>`).join('')}</div>`).join('');
  const gallery = content ? `<h2 id="application-details-title">ภาพรายละเอียดประกอบข้อเสนอ</h2><p class="application-details-intro">ภาพประกอบจากชุดนำเสนอ แยกให้เห็นการจัดพื้นที่ ป้าย และจุดบริการ เชื่อมกลับไปยังผังเดิมเพื่ออ่านตำแหน่งร่วมกัน</p>${content}<p class="application-detail-provenance"><a href="./${manifestPath}">ข้อมูลภาพและแหล่งอ้างอิง</a></p>` : '';
  const index = path.join(root, 'index.html');
  let html = fs.readFileSync(index, 'utf8');
  assert(html.includes('<!-- APPLICATION_DETAIL_JUMPS -->') && html.includes('<!-- APPLICATION_DETAILS -->'), 'Detail insertion markers missing');
  function insert(name, content) {
    const start = `<!-- ${name} -->`, end = `<!-- /${name} -->`;
    const begin = html.indexOf(start), finish = html.indexOf(end, begin);
    const prior = finish === -1 ? start : html.slice(begin, finish + end.length);
    html = html.replace(prior, `${start}\n${content}\n${end}`);
  }
  insert('APPLICATION_DETAIL_JUMPS', shortcuts); insert('APPLICATION_DETAILS', gallery);
  fs.writeFileSync(index, html);
  fs.writeFileSync(path.join(root, 'dist/index.html'), html);
  for (const name of ['application-details.js', 'application-details.css']) fs.copyFileSync(path.join(root, name), path.join(root, 'dist', name));
  console.log(`Application detail stills: ${manifest.items.length} accepted; v11 reference contract preserved.`);
}
if (require.main === module) run();
module.exports = run;
