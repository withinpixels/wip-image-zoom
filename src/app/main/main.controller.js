(function ()
{
    'use strict';

    angular
        .module('wipImageZoom')
        .controller('MainController', MainController);

    /** @ngInject */
    function MainController()
    {
        var vm = this;
        vm.zoomOptions1 = {
            defaultImage        : 0,
            style               : 'box',
            boxPos              : 'right-top',
            boxW                : 400,
            boxH                : 400,
            method              : 'lens',
            cursor              : 'crosshair',
            lens                : true,
            zoomLevel           : 3,
            immersiveMode       : '769',
            immersiveModeOptions: {
            },
            prevThumbButton     : '&#9665;',
            nextThumbButton     : '&#9655;',
            thumbsPos           : 'bottom',
            thumbCol            : 4,
            thumbColPadding     : 4,
            images              : [
                {
                    thumb : 'assets/images/1-thumb.jpg',
                    medium: 'assets/images/1-medium.jpg',
                    large : 'assets/images/1-large.jpg'
                },
                {
                    thumb : 'assets/images/2-thumb.jpg',
                    medium: 'assets/images/2-medium.jpg',
                    large : 'assets/images/2-large.jpg'
                },
                {
                    thumb : 'assets/images/3-thumb.jpg',
                    medium: 'assets/images/3-medium.jpg',
                    large : 'assets/images/3-large.jpg'
                },
                {
                    thumb : 'assets/images/4-thumb.jpg',
                    medium: 'assets/images/4-medium.jpg',
                    large : 'assets/images/4-large.jpg'
                },
                {
                    thumb : 'assets/images/5-thumb.jpg',
                    medium: 'assets/images/5-medium.jpg',
                    large : 'assets/images/5-large.jpg'
                },
                {
                    thumb : 'assets/images/6-thumb.jpg',
                    medium: 'assets/images/6-medium.jpg',
                    large : 'assets/images/6-large.jpg'
                },
                {
                    thumb : 'assets/images/7-thumb.jpg',
                    medium: 'assets/images/7-medium.jpg',
                    large : 'assets/images/7-large.jpg'
                }
            ]
        };
    }
})();