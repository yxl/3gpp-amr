#!/usr/bin/env node

var fs = require('fs');
var path = require('path');

var inPath = path.join(__dirname, 'audio.3gp');
var outPath = path.join(__dirname, 'audio.amr');

fs.readFile(inPath, function(err, buffer) {
  if (err) {
    console.error(err);
    return;
  }

  var outBuffer = convert3gpToAmr(buffer);
  fs.writeFile(outPath, outBuffer, 'binary', function(err) {
    if (err) {
      console.error(err);
      return;
    }
    console.log('Succeeded!');
  });
});

function convert3gpToAmr(uint8Array) {
    // The buffer to store the converted amr file.
    var outBuffer = new Buffer(uint8Array.length);

    // Add AMR header.
    var AMR_HEADER = '#!AMR\n';
    outBuffer.write(AMR_HEADER);
    var outOffset = AMR_HEADER.length;

    var inOffset = 0;
    while (inOffset + 8 < uint8Array.length) {
        // Get the box size
        var size = 0;
        for (var i = 0; i < 4; i++) {
            size = uint8Array[inOffset + i] + (size << 8);
        }
        // Search the box of type mdat.
        var type = uint8Array.toString('ascii', inOffset + 4, inOffset + 8);
        if (type === 'mdat' && inOffset + size <= uint8Array.length) {
            // Extract raw ARM data from the box and append to the out buffer.
            uint8Array.copy(outBuffer, outOffset, inOffset + 8, inOffset + size);
            outOffset += size - 8;
        }
        inOffset += size;
    }

    return outBuffer.slice(0, outOffset);
}
