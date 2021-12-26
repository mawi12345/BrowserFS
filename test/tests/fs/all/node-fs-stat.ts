import fs from '../../../../src/core/node_fs';
import * as path from 'path';
import assert from '../../../harness/wrapped-assert';
import common from '../../../harness/common';

export default function() {
  var got_error = false;
  var success_count = 0;
  var existing_dir = common.fixturesDir;
  var existing_file = path.join(common.fixturesDir, 'x.txt');

  // Empty string is not a valid file path.
  fs.stat('', function(err, stats) {
    if (err) {
      success_count++;
    } else {
      got_error = true;
    }
  });

  fs.stat(existing_dir, function(err, stats) {
    if (err) {
      got_error = true;
    } else {
      assert.ok(stats.mtime instanceof Date);
      success_count++;
    }
  });

  fs.lstat(existing_dir, function(err, stats) {
    if (err) {
      got_error = true;
    } else {
      assert.ok(stats.mtime instanceof Date);
      success_count++;
    }
  });

  // fstat
  fs.open(existing_file, 'r', undefined, function(err, fd) {
    assert.ok(!err);
    assert.ok(fd);

    fs.fstat(fd, function(err, stats) {
      if (err) {
        got_error = true;
      } else {
        assert.ok(stats.mtime instanceof Date);
        success_count++;
        fs.close(fd);
      }
    });
  });

  // fstat on dir
  fs.open(existing_dir, 'r', undefined, function(err, fd) {
    assert.ok(!err, 'open error: '+(err ? err.message : ''));
    assert.ok(fd);

    fs.fstat(fd, function(err, stats) {
      if (err) {
        got_error = true;
      } else {
        assert.equal(true, stats.isDirectory(), 'fstat on dir fd isDirectory');
        assert.ok(stats.mtime instanceof Date);
        success_count++;
        fs.close(fd);
      }
    });
  });

  if (fs.getRootFS().supportsSynch()) {
    // fstatSync
    fs.open(existing_file, 'r', undefined, function(err, fd) {
      var stats: any;
      try {
        stats = fs.fstatSync(fd);
      } catch (e) {
        got_error = true;
      }
      if (stats) {
        assert.ok(stats.mtime instanceof Date);
        success_count++;
      }
      fs.close(fd);
    });
    
    // fstatSync on dir
    fs.open(existing_dir, 'r', undefined, function(err, fd) {
      var stats: any;
      try {
        stats = fs.fstatSync(fd);
      } catch (e) {
        got_error = true;
      }
      if (stats) {
        assert.equal(true, stats.isDirectory(), 'fstatSync on dir fd isDirectory');
        assert.ok(stats.mtime instanceof Date);
        success_count++;
      }
      fs.close(fd);
    });
  }

  fs.stat(existing_file, function(err, s) {
    if (err) {
      got_error = true;
    } else {
      success_count++;
      assert.equal(false, s.isDirectory());
      assert.equal(true, s.isFile());
      assert.equal(false, s.isSocket());
      //assert.equal(false, s.isBlockDevice());
      assert.equal(false, s.isCharacterDevice());
      assert.equal(false, s.isFIFO());
      assert.equal(false, s.isSymbolicLink());

      assert.ok(s.mtime instanceof Date);
    }
  });

  process.on('exit', function() {
    var expected_success = 6;
    if (fs.getRootFS().supportsSynch()) expected_success += 2;
    assert.equal(expected_success, success_count);
    assert.equal(false, got_error);
  });
};
