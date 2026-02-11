const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '..', 'tests', 'fixtures', '1_Form16_Sample.pdf');
const dstDir = path.resolve('C:/temp');
const baseName = '1_Form16_Sample.trailing-blob.pdf';
let dst = path.join(dstDir, baseName);

if (!fs.existsSync(dstDir)) fs.mkdirSync(dstDir, { recursive: true });

if (fs.existsSync(dst)) {
	try {
		fs.unlinkSync(dst);
	} catch {
		dst = path.join(dstDir, `1_Form16_Sample.trailing-blob.${Date.now()}.pdf`);
	}
}

const input = fs.readFileSync(src);
const pad = Buffer.alloc(2_000_000);

fs.writeFileSync(dst, Buffer.concat([input, pad]));
console.log(dst);
console.log('bytes=' + fs.statSync(dst).size);
