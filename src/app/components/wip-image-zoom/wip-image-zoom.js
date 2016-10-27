angular
    .module('wipImageZoom', ['ngSanitize'])
    .directive('imageOnLoad', imageOnLoadDirective)
    .directive('wipImageZoom', wipImageZoomDirective)
    .directive('wipImageZoomTracker', wipImageZoomTrackerDirective)
    .directive('wipImageZoomLens', wipImageZoomLensDirective)
    .directive('wipImageZoomMask', wipImageZoomMaskDirective)
    .directive('wipImageZoomImage', wipImageZoomImageDirective)
    .directive('wipImageZoomThumbs', wipImageZoomThumbsDirective);

function wipImageZoomDirective($timeout) {
    return {
        restrict    : 'EA',
        template    : '<div class="wip-image-zoom {{vm.options.style}}-style {{vm.options.thumbsPos}}-thumbs"\n     ng-class="{\'active\':vm.zoomActive}">\n\n    <wip-image-zoom-thumbs ng-if="vm.options.thumbsPos === \'top\' && vm.images.length > 1"></wip-image-zoom-thumbs>\n\n    <div class="main-image-wrapper">\n        <div class="image-zoom-tracker" wip-image-zoom-tracker></div>\n        <div class="image-zoom-lens" wip-image-zoom-lens></div>\n        <img class="main-image" ng-src="{{vm.mainImage.medium}}">\n        <div class="zoom-mask" wip-image-zoom-mask>\n            <img wip-image-zoom-image class="zoom-image main-image-large"\n                 ng-src="{{vm.mainImage.large}}" image-on-load="vm.initZoom()">\n        </div>\n    </div>\n\n    <wip-image-zoom-thumbs ng-if="vm.options.thumbsPos === \'bottom\' && vm.images.length > 1"></wip-image-zoom-thumbs>\n    \n</div>',
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
            var vm = this,
                evPosX, evPosY, trackerW, trackerH, trackerL, trackerT, maskL, maskT, maskW, maskH, zoomImgW, zoomImgH, lensW, lensH, lensPosX, lensPosY, zoomLevelRatio,
                defaultOpts = {
                    defaultImage   : 0, // Order of the default selected Image
                    images         : [],
                    style          : 'inner', // inner or box
                    method         : 'lens', // fallow 'lens' or 'pointer'
                    cursor         : 'crosshair', // 'none', 'default', 'crosshair', 'pointer', 'move'
                    lens           : true,
                    zoomLevel      : 3, // 0: not scales, uses the original large image size, use 1 and above to adjust.
                    prevThumbButton: '&#9665;',
                    nextThumbButton: '&#9655;',
                    thumbsPos      : 'bottom',
                    thumbCol       : 3,
                    thumbColPadding: 4
                };

            vm.el;
            vm.zoomTracker;
            vm.zoomLens;
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
            vm.thumbsPosX;

            vm.init = init;
            vm.initZoom = initZoom;
            vm.initThumbs = initThumbs;

            vm.updateMainImage = updateMainImage;
            vm.nextThumb = nextThumb;
            vm.prevThumb = prevThumb;

            function init() {
                vm.options = !$scope.wipImageZoom ? defaultOpts : angular.extend(defaultOpts, $scope.wipImageZoom);
                vm.images = vm.options.images;

                vm.mainImage = vm.images[vm.options.defaultImage];

                $scope.selectedImage = vm.mainImage;
            }

            function initZoom() {
                initSizes();

                vm.zoomTracker.style.cursor = vm.options.cursor;

                if (vm.options.lens) {
                    vm.zoomLens.style.display = 'block';
                } else {
                    vm.zoomLens.style.display = 'none';
                }

                vm.zoomTracker.addEventListener('mouseenter', zoomStateEnable);
                vm.zoomTracker.addEventListener('touchstart', zoomStateEnable);

                vm.zoomTracker.addEventListener('mouseleave', zoomStateDisable);
                vm.zoomTracker.addEventListener('touchend', zoomStateDisable);

                vm.zoomTracker.addEventListener('mousemove', setZoomImagePosition);
                vm.zoomTracker.addEventListener('touchmove', setZoomImagePosition);
            }

            function initThumbs() {
                scrollThumbs(0);
                vm.thumbsWrapperWidth = vm.thumbsWrapper.clientWidth;
                vm.thumbWidth = (vm.thumbsWrapperWidth + vm.options.thumbColPadding) / vm.options.thumbCol;
                vm.thumbsWidth = vm.thumbWidth * vm.images.length;
                // Set Thumbnail width
                $scope.$evalAsync(function () {
                    vm.thumbsPosX = 0;

                    vm.thumbsEl.style.paddingTop = vm.options.thumbColPadding + 'px';
                    for (var i = 0; i < vm.thumbsEl.children.length; i++) {
                        var thumb = vm.thumbsEl.children[i];
                        thumb.style.width = vm.thumbWidth + 'px';
                        thumb.style.paddingRight = vm.options.thumbColPadding + 'px';
                    }
                });
            }

            function nextThumb() {
                vm.thumbsPosX = vm.thumbsPosX + vm.thumbWidth;
                scrollThumbs(vm.thumbsPosX * -1);
            }

            function prevThumb() {
                vm.thumbsPosX = vm.thumbsPosX - vm.thumbWidth;
                scrollThumbs(vm.thumbsPosX * -1);
            }

            function scrollThumbs(posX, posY) {
                posX = posX || 0;
                posY = posY || 0;
                vm.thumbsEl.style.transform = 'translate3d(' + posX + 'px,' + posY + 'px, 0)';
            }

            function initSizes(e) {
                trackerW = vm.zoomTracker.offsetWidth;
                trackerH = vm.zoomTracker.offsetHeight;
                trackerL = vm.zoomTracker.offsetParent.offsetLeft;
                trackerT = vm.zoomTracker.offsetParent.offsetTop;
                maskL = vm.options.style === 'inner' ? trackerL : vm.zoomMaskEl.offsetParent.offsetLeft;
                maskT = vm.options.style === 'inner' ? trackerT : vm.zoomMaskEl.offsetParent.offsetTop;
                maskW = vm.options.style === 'inner' ? trackerW : vm.zoomMaskEl.offsetWidth;
                maskH = vm.options.style === 'inner' ? trackerH : vm.zoomMaskEl.offsetHeight;

                if (vm.options.zoomLevel > 1) {
                    vm.zoomImageEl.style.width = trackerW * vm.options.zoomLevel + 'px';
                    vm.zoomImageEl.style.height = trackerH * vm.options.zoomLevel + 'px';
                }

                zoomImgW = vm.zoomImageEl.offsetWidth;
                zoomImgH = vm.zoomImageEl.offsetHeight;

                setLensSize();

            }

            function setZoomImagePosition(e) {
                e.preventDefault();
                var te = e.type == 'touchmove' && e.touches && e.touches[0];

                evPosX = te && te.pageX || e.pageX;
                evPosY = te && te.pageY || e.pageY;

                setLensPosition();

                if (vm.options.method === 'lens') {
                    trackLens();
                }
                // pointer
                else {
                    trackPointer();
                }

            }

            function trackLens() {
                var posX = [(zoomImgW - maskW + lensW * 1 / zoomLevelRatio) * [(lensPosX / trackerW)]];
                var posY = [(zoomImgH - maskH + lensH * 1 / zoomLevelRatio) * [lensPosY / trackerH]];
                vm.zoomImageEl.style.transform = 'translate3d(' + posX * -1 + 'px,' + posY * -1 + 'px,0)';
            }

            function trackPointer() {
                var posX = [(zoomImgW - maskW) * [(evPosX - trackerL) / trackerW]];
                var posY = [(zoomImgH - maskH) * [(evPosY - trackerT) / trackerH]];

                // Touch Fixes
                posX = evPosX < trackerL ? 0 : posX;
                posY = evPosY < trackerT ? 0 : posY;
                posX = evPosX > trackerL + trackerW ? (zoomImgW - maskW) : posX;
                posY = evPosY > trackerT + trackerH ? (zoomImgH - maskH) : posY;

                vm.zoomImageEl.style.transform = 'translate3d(' + posX * -1 + 'px,' + posY * -1 + 'px,0)';
            }

            function setLensSize() {
                zoomLevelRatio = trackerW / zoomImgW;
                lensW = maskW * zoomLevelRatio;
                lensH = maskH * zoomLevelRatio;
                vm.zoomLens.style.width = lensW + 'px';
                vm.zoomLens.style.height = lensH + 'px';
            }

            function setLensPosition() {
                lensPosX = (evPosX - trackerL) - lensW * 0.5;
                lensPosY = (evPosY - trackerT) - lensH * 0.5;

                lensPosX = lensPosX > (trackerW - lensW) ? trackerW - lensW : lensPosX;
                lensPosX = lensPosX < 0 ? 0 : lensPosX;

                lensPosY = lensPosY > (trackerH - lensH) ? trackerH - lensH : lensPosY;
                lensPosY = lensPosY < 0 ? 0 : lensPosY;

                vm.zoomLens.style.transform = 'translate3d(' + lensPosX + 'px,' + lensPosY + 'px,0)';

            }

            function updateThumbsPos() {
                var selectedIndex = getSelectedIndex();
                var selectedEl = vm.thumbsEl.children[selectedIndex];
                var isInView = vm.thumbsPosX <= selectedEl.offsetLeft && selectedEl.offsetLeft < vm.thumbsPosX + vm.thumbsWrapperWidth;

                if (isInView) {
                    return;
                }

                vm.thumbsPosX = selectedEl.offsetLeft;

                if ((vm.thumbsWidth - vm.thumbsPosX) <= vm.thumbsWrapperWidth) {
                    vm.thumbsPosX = vm.thumbWidth * (vm.options.images.length - vm.options.thumbCol);
                }

                scrollThumbs(vm.thumbsPosX * -1);

            }

            function getSelectedIndex() {
                for (var i = 0; i < vm.images.length; i++) {
                    if (vm.images[i].medium === vm.mainImage.medium) {
                        return i;
                    }
                }
            }

            function toogleZoomState(state) {
                $scope.$evalAsync(function () {
                    vm.zoomActive = state || !vm.zoomActive;
                })
            }

            function zoomStateEnable() {
                $scope.$evalAsync(function () {
                    vm.zoomActive = true;
                })
            }

            function zoomStateDisable() {
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
                    updateThumbsPos();
                }
            }, true);

            angular.element(window).on('resize', function (e) {
                initZoom();
                initThumbs();
            });

            $scope.$watch('wipImageZoom', function (newVal, oldVal) {
                if (newVal !== undefined && newVal !== oldVal) {
                    init();
                    initZoom();
                    initThumbs();
                }
            }, true);
        }
    }
};

function wipImageZoomLensDirective() {
    return {
        restrict: 'EA',
        require : '^wipImageZoom',
        link    : function (scope, element, attrs, ctrl) {
            ctrl.zoomLens = element[0];
        }
    }
}

function wipImageZoomTrackerDirective() {
    return {
        restrict: 'EA',
        require : '^wipImageZoom',
        link    : function (scope, element, attrs, ctrl) {
            ctrl.zoomTracker = element[0];
        }
    }
}

function wipImageZoomMaskDirective() {
    return {
        restrict: 'EA',
        require : '^wipImageZoom',
        link    : function (scope, element, attrs, ctrl) {
            ctrl.zoomMaskEl = element[0];
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
        template: '<div class="thumbs-wrapper">\n    <div class="thumbs">\n        <div class="thumb-wrapper" ng-repeat="image in vm.images">\n            <img ng-src="{{image.thumb}}" ng-click="vm.updateMainImage(image)"\n                 ng-class="{\'selected\': vm.mainImage.thumb === image.thumb}">\n        </div>\n    </div>\n</div>\n<div class="prev-button" ng-if="vm.thumbsPosX !== 0"\n     ng-click="vm.prevThumb()"\n     ng-bind-html="vm.options.prevThumbButton">Prev\n</div>\n<div class="next-button"\n     ng-if="vm.thumbsPosX < vm.thumbWidth * (vm.options.images.length - vm.options.thumbCol)"\n     ng-click="vm.nextThumb()"\n     ng-bind-html="vm.options.nextThumbButton">Next\n</div>',
        link    : function (scope, element, attrs, ctrl) {
            ctrl.thumbsWrapper = element[0].getElementsByClassName('thumbs-wrapper')[0];
            ctrl.thumbsEl = element[0].getElementsByClassName('thumbs')[0];
            ctrl.initThumbs();
        }
    }
}

function imageOnLoadDirective() {
    return {
        restrict: 'A',
        link    : function (scope, element, attrs) {
            element[0].addEventListener('load', function () {
                scope.$apply(attrs.imageOnLoad);
            }, false);
            element[0].addEventListener('error', function () {
                console.warn('image could not be loaded');
            });
        }
    };
}