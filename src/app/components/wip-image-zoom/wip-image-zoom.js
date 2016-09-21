angular
    .module('wipImageZoom', ['ngSanitize'])
    .directive('wipImageZoom', wipImageZoomDirective)
    .directive('wipImageZoomTracker', wipImageZoomTrackerDirective)
    .directive('wipImageZoomImage', wipImageZoomImageDirective)
    .directive('wipImageZoomThumbs', wipImageZoomThumbsDirective);

function wipImageZoomDirective($timeout) {
    return {
        restrict    : 'EA',
        template    : '<div class="wip-image-zoom">\n    <div wip-image-zoom-tracker class="main-image-wrapper">\n        <img class="main-image" ng-src="{{vm.mainImage.medium}}">\n        <div class="zoom-mask">\n            <img wip-image-zoom-image ng-class="{\'active\':vm.zoomActive}" class="zoom-image main-image-large"\n                 ng-src="{{vm.mainImage.large}}">\n        </div>\n    </div>\n\n    <wip-image-zoom-thumbs ng-if="vm.images.length > 1">\n        <div class="thumbs-wrapper">\n            <div class="thumbs">\n                <div class="thumb-wrapper" ng-repeat="image in vm.images">\n                    <img ng-src="{{image.thumb}}" ng-click="vm.updateMainImage(image)"\n                         ng-class="{\'selected\': vm.mainImage.thumb === image.thumb}">\n                </div>\n            </div>\n        </div>\n        <div class="prev-button" ng-if="vm.thumbsPosX !== 0"\n             ng-click="vm.prevThumb()"\n             ng-bind-html="vm.options.prevThumbButton">Prev\n        </div>\n        <div class="next-button" ng-if="(vm.thumbsWidth - vm.thumbsPosX) > vm.thumbsWrapperWidth"\n             ng-click="vm.nextThumb()"\n             ng-bind-html="vm.options.nextThumbButton">Next\n        </div>\n    </wip-image-zoom-thumbs>\n</div>',
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
                prevThumbButton:'&#9665;',
                nextThumbButton:'&#9655;'
            };

            vm.el;
            vm.zoomTracker;
            vm.zoomImageEl;
            vm.thumbsWrapper;
            vm.thumbsEl;
            vm.mainImage;
            vm.options;
            vm.images = [];
            vm.zoomActive = false;

            vm.prevThumbActive = false;
            vm.nextThumbActive = false;
            vm.thumbWidth;
            vm.thumbsWrapperWidth;
            vm.thumbsWidth;
            vm.thumbsPosX = 0;

            vm.init = init;
            vm.initThumbs = initThumbs;

            vm.updateMainImage = updateMainImage;
            vm.nextThumb = nextThumb;
            vm.prevThumb = prevThumb;

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

            function initThumbs() {
                vm.thumbsWrapperWidth = vm.thumbsWrapper.clientWidth;
                vm.thumbWidth = vm.thumbsWrapperWidth * 0.30;
                vm.thumbsWidth = vm.thumbWidth * vm.images.length;
            }

            function nextThumb() {
                if ((vm.thumbsWidth - vm.thumbsPosX) < vm.thumbsWrapperWidth) {
                    return;
                }

                vm.thumbsPosX = vm.thumbsPosX + vm.thumbWidth;

                if ((vm.thumbsWidth - vm.thumbsPosX) <= vm.thumbsWrapperWidth) {
                    scrollThumbs((vm.thumbsWidth - vm.thumbsWrapperWidth - 8) * -1);
                    return;
                }

                scrollThumbs(vm.thumbsPosX * -1);

            }

            function prevThumb() {
                if ((vm.thumbsPosX - vm.thumbWidth) < 0) {
                    return;
                }
                vm.thumbsPosX = vm.thumbsPosX - vm.thumbWidth;
                scrollThumbs(vm.thumbsPosX * -1);
            }

            function scrollThumbs(posX, posY) {
                posX = posX || 0;
                posY = posY || 0;
                vm.thumbsEl.style.transform = 'translate3d(' + posX + 'px,' + posY + 'px, 0)';
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

function wipImageZoomThumbsDirective() {
    return {
        restrict: 'EA',
        require : '^wipImageZoom',
        link    : function (scope, element, attrs, ctrl) {
            ctrl.thumbsWrapper = element[0].getElementsByClassName('thumbs-wrapper')[0];
            ctrl.thumbsEl = element[0].getElementsByClassName('thumbs')[0];
            ctrl.initThumbs();
        }
    }
}
