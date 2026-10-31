"""Validate the actual Gulp ZIP, extract it safely, and compare all source bytes."""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import tempfile
import zipfile

root = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('archive', type=Path)
parser.add_argument('--extract', type=Path)
parser.add_argument('--report', type=Path)
parser.add_argument('--expect-js-sha256')
args = parser.parse_args()

expected = {f.relative_to(root).as_posix() for f in root.glob('*.hbs')}
for folder in ['partials', 'assets']:
    expected.update(f.relative_to(root).as_posix() for f in (root / folder).rglob('*') if f.is_file())
expected.update(name for name in ['routes.yaml', 'package.json', 'gulpfile.js', 'LICENSE', 'README.md'] if (root / name).is_file())

with zipfile.ZipFile(args.archive) as archive:
    assert archive.testzip() is None, 'ZIP CRC failure'
    entries = archive.infolist()
    for entry in entries:
        path = PurePosixPath(entry.filename)
        assert not path.is_absolute() and '..' not in path.parts and '\\' not in entry.filename, entry.filename
    files = [entry.filename for entry in entries if not entry.is_dir()]
    assert len(files) == len(set(files)), 'Duplicate ZIP file'
    assert set(files) == expected, {'missing': sorted(expected - set(files)), 'extra': sorted(set(files) - expected)}
    for name in files:
        data = archive.read(name)
        assert data == (root / name).read_bytes(), 'Source mismatch: ' + name
        assert not re.search(rb'-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----', data), name
        assert not re.search(rb'(?:[?&]key=|data-key=["\x27])[a-f0-9]{20,}', data, re.I), name
    package = json.loads(archive.read('package.json'))
    assert package['version'] == json.loads((root / 'package.json').read_text())['version']
    js_sha = hashlib.sha256(archive.read('assets/built/main.min.js')).hexdigest()
    if args.expect_js_sha256:
        assert js_sha == args.expect_js_sha256, 'Unexpected JS change'
    def extract_and_check(destination):
        destination.mkdir(parents=True, exist_ok=True)
        assert not any(destination.iterdir()), 'Extraction target must be empty'
        archive.extractall(destination)
        for name in files:
            assert (destination / name).read_bytes() == archive.read(name), 'Extract mismatch: ' + name
    if args.extract:
        extract_and_check(args.extract.resolve())
    else:
        with tempfile.TemporaryDirectory(prefix='ayu-zip-check-') as temporary:
            extract_and_check(Path(temporary))

result = {'status': 'PASS', 'version': package['version'], 'zipSha256': hashlib.sha256(args.archive.read_bytes()).hexdigest(), 'jsSha256': js_sha, 'files': sorted(files), 'fileCount': len(files), 'crc': 'PASS', 'sourceBytes': 'PASS', 'extraction': 'PASS', 'unexpectedFilesOrCredentials': False}
if args.report:
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(result, indent=2) + '\n')
print(f"PASS: ZIP {len(files)} files, CRC/extraction/source bytes; JS SHA-256 {js_sha}")
