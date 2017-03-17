(function ()
{
    'use strict';

    angular
        .module('wipImageZoomDemo')
        .config(config);

    /** @ngInject */
    function config(wipImageZoomConfigProvider)
    {
        wipImageZoomConfigProvider.setDefaults({
        });
    }

})();
