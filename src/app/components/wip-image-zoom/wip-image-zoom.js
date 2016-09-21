angular
    .module('wipImageZoom', [])
    .directive('wipImageZoom', wipImageZoomDirective)
    .directive('wipImageZoomTracker', wipImageZoomTrackerDirective)
    .directive('wipImageZoomImage', wipImageZoomImageDirective);

function wipImageZoomDirective() {
    return {
        restrict    : 'EA',
        template    : '<div class="wip-image-zoom">\n    <div wip-image-zoom-tracker class="main-image-wrapper">\n        <img class="main-image" ng-src="{{vm.mainImage.medium}}">\n        <div class="zoom-mask">\n            <img wip-image-zoom-image ng-class="{\'active\':vm.zoomActive}" class="zoom-image main-image-large"\n                 ng-src="{{vm.mainImage.large}}">\n        </div>\n    </div>\n\n    <div ng-if="vm.images.length > 1" class="thumbs">\n        <div class="thumb-wrapper" ng-repeat="image in vm.images">\n            <img ng-src="{{image.thumb}}" ng-click="vm.updateMainImage(image)"\n                 ng-class="{\'selected\': vm.mainImage.thumb === image.thumb}">\n        </div>\n    </div>\n    <pre>{{vm.images | json}}</pre>\n</div>',
        replace     : true,
        scope       : {
            selectedImage: '=',
            wipImageZoom : '='
        },
        controllerAs: 'vm',
        link        : function (scope, element, attrs, ctrl) {
            ctrl.el = element;
            ctrl.init();
        },
        controller  : function ($scope) {
            var vm = this;
            var lastPosX, lastPosY;
            var defaultOpts = {
                defaultImage: 0, // Order of the default selected Image
                images      : [],
                zoomLevel   : 0, // 0: not scales, uses the original large image size, use 1 and above to adjust.
            };

            vm.el;
            vm.zoomTracker;
            vm.zoomImageEl;
            vm.mainImage;
            vm.options;
            vm.images = [];
            vm.zoomActive = false;

            vm.init = init;
            vm.updateMainImage = updateMainImage;

            function init() {
                vm.options = !$scope.wipImageZoom ? defaultOpts : angular.extend(defaultOpts, $scope.wipImageZoom);
                vm.images = vm.options.images;

                vm.mainImage = vm.images[vm.options.defaultImage];

                $scope.selectedImage = vm.mainImage;

                vm.zoomTracker.addEventListener('mouseenter', ZoomStateEnable);
                vm.zoomTracker.addEventListener('touchstart', ZoomStateEnable);

                vm.zoomTracker.addEventListener('mouseleave', ZoomStateDisable);
                vm.zoomTracker.addEventListener('touchend', ZoomStateDisable);

                vm.zoomTracker.addEventListener('mousemove', setZoomImagePosition);
                vm.zoomTracker.addEventListener('touchmove', setZoomImagePosition);
            }

            function setZoomImagePosition(e) {
                e.preventDefault();
                var te = e.type == 'touchmove' && e.touches && e.touches[0];
                lastPosX = te && te.clientX || e.clientX;
                lastPosY = te && te.clientY || e.clientY;

                var tContW = vm.zoomTracker.offsetWidth,
                    tContH = vm.zoomTracker.offsetHeight,
                    tContL = vm.zoomTracker.offsetLeft,
                    tContT = vm.zoomTracker.offsetTop;

                if (vm.options.zoomLevel > 1) {
                    vm.zoomImageEl.style.width = tContW * vm.options.zoomLevel + 'px';
                    vm.zoomImageEl.style.height = tContH * vm.options.zoomLevel + 'px';
                }

                var zoomImgW = vm.zoomImageEl.offsetWidth,
                    zoomImgH = vm.zoomImageEl.offsetHeight;


                var posX = (zoomImgW - tContW) * (lastPosX - tContL) / tContW;
                var posY = (zoomImgH - tContH) * (lastPosY - tContT) / tContH;

                posX = lastPosX < tContL ? 0 : posX;
                posY = lastPosY < tContT ? 0 : posY;

                posX = lastPosX > tContL + tContW ? (zoomImgW - tContW) : posX;
                posY = lastPosY > tContT + tContH ? (zoomImgH - tContH) : posY;

                vm.zoomImageEl.style.transform = 'translate3d(' + posX * -1 + 'px,' + posY * -1 + 'px,0)';
            }

            function toogleZoomState(state) {
                $scope.$evalAsync(function () {
                    console.log('toggled');
                    vm.zoomActive = state || !vm.zoomActive;
                })
            }

            function ZoomStateEnable() {
                $scope.$evalAsync(function () {
                    vm.zoomActive = true;
                })
            }

            function ZoomStateDisable() {
                $scope.$evalAsync(function () {
                    vm.zoomActive = false;
                })
            }

            function updateMainImage(image) {
                vm.mainImage = image;
                $scope.selectedImage = vm.mainImage;
            }

            $scope.$watch('selectedImage', function (newVal, oldVal) {
                if (newVal !== undefined && newVal !== oldVal) {
                    vm.mainImage = newVal;
                }
            });
        }
    }
};

function wipImageZoomTrackerDirective() {
    return {
        restrict: 'EA',
        require : '^wipImageZoom',
        link    : function (scope, element, attrs, ctrl) {
            ctrl.zoomTracker = element[0];
        }
    }
}

function wipImageZoomImageDirective() {
    return {
        restrict: 'EA',
        require : '^wipImageZoom',
        link    : function (scope, element, attrs, ctrl) {
            ctrl.zoomImageEl = element[0];
        }
    }
}
