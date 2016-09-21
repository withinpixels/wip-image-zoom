(function() {
  'use strict';

  angular
    .module('wipImageZoomDemo')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
