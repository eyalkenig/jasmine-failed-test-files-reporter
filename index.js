module.exports = (function() {
  const failedTestFileReporter = function(config) {
    let failedFiles = [];
    let specFileNameRegex = '.spec.ts';
    const regex = /at.* \({0,1}(.*|\w*):(.*):\d*/;

    function parse(stackError) {
      const filePaths = [];
      if (!stackError) {
        return filePaths;
      }
    
      const lines = stackError.split('\n');
      for (var i=0;i<lines.length;i++) {
        const result = lines[i].match(regex);
        if (result && result[1]) {
          filePaths.push(result[1]);
        }
      }
      return filePaths;
    }
    
    function first(items, predicat) {
      for (var i=0;i<items.length;i++) {
        if (predicat(items[i])) {
          return items[i];
        }
      }
      return undefined;
    }
    
    if (config && config.specFileNameRegex) {
      specFileNameRegex = config.specFileNameRegex;
    }
    
    function isSpec(filename) {
      return filename.match(specFileNameRegex);
    }
    
    return {
      jasmineStarted: function() {
        failedFiles = [];
      },
      specDone: function(result) {
        const failedExpectations = result.failedExpectations;
        if (failedExpectations && failedExpectations.length > 0) {
          const firstFailedStack = failedExpectations[0].stack;
          const stackTraceFilePaths = parse(firstFailedStack);
          const filePath = first(stackTraceFilePaths, isSpec);
          if (filePath) {
            failedFiles.push(filePath);
          }
        }
      },
      getFailedFiles: function() {
        return failedFiles;
      }
    };
  };
  return {
    newReporter: failedTestFileReporter
  }
})();
