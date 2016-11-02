(function () {
    'use strict';

    angular
        .module('wipImageZoom')
        .controller('MainController', MainController);

    /** @ngInject */
    function MainController($timeout, toastr) {
        var vm = this;
        vm.showToastr = showToastr;
        vm.zoomOptions1 = {
            defaultImage   : 0, // Order of the default selected Image
            style          : 'box', // inner or box
            boxPos         : 'right-middle',
            boxW           : 400,
            boxH           : 400,
            method         : 'lens', // fallow 'lens' or 'pointer'
            cursor         : 'crosshair', // 'none', 'default', 'crosshair', 'pointer', 'move'
            lens           : true,
            zoomLevel      : 3, // 0: not scales, uses the original large image size, use 1 and above to adjust.
            immersiveMode  : 769,
            prevThumbButton: '&#9665;',
            nextThumbButton: '&#9655;',
            thumbsPos      : 'top',
            thumbCol       : 4,
            thumbColPadding: 4,
            images         : [
                {
                    thumb : '/assets/images/1-thumb.jpg',
                    medium: '/assets/images/1-medium.jpg',
                    large : '/assets/images/1-large.jpg'
                },
                {
                    thumb : '/assets/images/2-thumb.jpg',
                    medium: '/assets/images/2-medium.jpg',
                    large : '/assets/images/2-large.jpg'
                },
                {
                    thumb : '/assets/images/3-thumb.jpg',
                    medium: '/assets/images/3-medium.jpg',
                    large : '/assets/images/3-large.jpg'
                },
                {
                    thumb : '/assets/images/4-thumb.jpg',
                    medium: '/assets/images/4-medium.jpg',
                    large : '/assets/images/4-large.jpg'
                },
                {
                    thumb : '/assets/images/5-thumb.jpg',
                    medium: '/assets/images/5-medium.jpg',
                    large : '/assets/images/5-large.jpg'
                },
                {
                    thumb : '/assets/images/6-thumb.jpg',
                    medium: '/assets/images/6-medium.jpg',
                    large : '/assets/images/6-large.jpg'
                },
                {
                    thumb : '/assets/images/7-thumb.jpg',
                    medium: '/assets/images/7-medium.jpg',
                    large : '/assets/images/7-large.jpg'
                }
            ]
        };

        function showToastr() {
            toastr.info('Fork <a href="https://github.com/Swiip/generator-gulp-angular" target="_blank"><b>generator-gulp-angular</b></a>');
            vm.classAnimation = '';
        }

    }
})();
