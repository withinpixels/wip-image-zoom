(function ()
{
    'use strict';

    imageOnLoadDirective.$inject = ["$log"];
    wipImageZoomDirective.$inject = ["$timeout"];
    angular
        .module('wipImageZoom', ['ngSanitize', 'ngTouch'])
        .provider('wipImageZoomConfig', wipImageZoomConfig)
        .directive('imageOnLoad', imageOnLoadDirective)
        .directive('wipImageZoom', wipImageZoomDirective)
        .directive('wipImageZoomTracker', wipImageZoomTrackerDirective)
        .directive('wipImageZoomLens', wipImageZoomLensDirective)
        .directive('wipImageZoomMask', wipImageZoomMaskDirective)
        .directive('wipImageZoomImage', wipImageZoomImageDirective)
        .directive('wipImageZoomThumbs', wipImageZoomThumbsDirective);


    function wipImageZoomConfig()
    {
        this.defaults = {
            zoomEnable          : true,
            defaultIndex        : 0, // Order of the default selected Image
            /* You should give images in array with object properties
             [{
             thumb : 'assets/images/1-thumb.jpg',
             medium: 'assets/images/1-medium.jpg',
             large : 'assets/images/1-large.jpg'
             }] */
            images              : [],
            style               : 'inner', // inner or box
            boxPos              : 'right-top', // e.g., right-top, right-middle, right-bottom, top-center, top-left, top-right ...
            boxW                : 400, // Box width
            boxH                : 400, // Box height
            method              : 'lens', // fallow 'lens' or 'pointer'
            cursor              : 'crosshair', // 'none', 'default', 'crosshair', 'pointer', 'move'
            lens                : true, // Lens toggle
            zoomLevel           : 3, // 0: not scales, uses the original large image size, use 1 and above to adjust.
            immersiveMode       : '769', // false or 0 for disable, always, max width(px) for trigger
            immersiveModeOptions: {}, // can extend immersed mode options
            immersiveModeMessage: 'Click to Zoom', // Immersive mode message
            prevThumbButton     : '&#9665;', // Prev thumb button (html)
            nextThumbButton     : '&#9655;', // Next thumb button (html)
            thumbsPos           : 'bottom', // Thumbs position: 'top', 'bottom'
            thumbCol            : 3, // Thumb column count
            thumbColPadding     : 4 // Padding between thumbs
        };

        this.setDefaults = function (defaults)
        {
            this.defaults = angular.extend(this.defaults, defaults);
        };

        this.$get = function ()
        {
            return this;
        };

    }

    function wipImageZoomDirective($timeout)
    {
        return {
            restrict    : 'EA',
            template    : '<div class="wip-image-zoom {{vm.options.style}}-style {{vm.options.thumbsPos}}-thumbs"\n     ng-class="{\n     \'active\':vm.zoomActive, \n     \'immersive-mode\':vm.immersiveModeActive && !immersive,\n     \'zoom-disabled\':!vm.options.zoomEnable,\n     \'box-style\':vm.options.style == \'box\' ,\n     \'inner-style\':vm.options.style == \'inner\'}">\n\n    <wip-image-zoom-thumbs ng-if="vm.options.thumbsPos === \'top\' && vm.images.length > 1"></wip-image-zoom-thumbs>\n\n    <div ng-hide="!vm.options.zoomEnable && immersive" class="main-image-wrapper" ng-class="{\'loading\':vm.largeImageLoading}">\n        <div class="image-zoom-tracker" wip-image-zoom-tracker></div>\n        <div class="image-zoom-lens" wip-image-zoom-lens></div>\n        <img class="main-image" ng-src="{{vm.mainImage.medium}}" image-on-load="vm.initZoom()">\n        <div class="zoom-mask"\n             ng-class="vm.options.style == \'box\'? vm.options.boxPos : \'\'"\n             wip-image-zoom-mask>\n            <img wip-image-zoom-image class="zoom-image main-image-large" image-on-load="vm.largeImageLoaded()"\n                 ng-src="{{vm.mainImage.large}}">\n        </div>\n        <div ng-if="vm.immersiveModeActive && !immersive && vm.options.immersiveModeMessage !== \'\'"\n             class="immersive-mode-message" ng-bind="vm.options.immersiveModeMessage"></div>\n    </div>\n\n    <div class="immersive-no-zoom-image-wrapper" ng-show="!vm.options.zoomEnable && immersive">\n        <img class="main-image-large" ng-src="{{vm.mainImage.large}}">\n    </div>\n\n    <wip-image-zoom-thumbs\n            ng-if="vm.options.thumbsPos === \'bottom\' && vm.images.length > 1"></wip-image-zoom-thumbs>\n</div>',
            replace     : true,
            scope       : {
                selectedModel: '=?',
                selectedIndex: '=?',
                wipImageZoom : '=',
                immersive    : '=?'
            },
            controllerAs: 'vm',
            link        : function (scope, element, attrs, ctrl)
            {
                ctrl.el = element;
                ctrl.attrs = attrs;
                ctrl.init();
            },
            controller  : ["$scope", "$document", "$window", "$compile", "wipImageZoomConfig", function ($scope, $document, $window, $compile, wipImageZoomConfig)
            {
                var vm = this,
                    evPosX, evPosY, trackerW, trackerH, trackerL, trackerT, maskW, maskH, zoomImgW, zoomImgH, lensW, lensH, lensPosX, lensPosY, zoomLevelRatio,
                    defaultOpts = angular.copy(wipImageZoomConfig.defaults),
                    updateTimeout = true;

                vm.el = {};
                vm.zoomTracker = {};
                vm.zoomLens = {};
                vm.zoomImageEl = {};
                vm.thumbsWrapper = {};
                vm.thumbsEl = {};
                vm.mainImage = {};
                vm.options = {};
                vm.images = [];
                vm.zoomActive = false;
                vm.largeImageLoading = true;

                vm.prevThumbActive = false;
                vm.nextThumbActive = false;
                vm.thumbWidth = 0;
                vm.thumbsWrapperWidth = 0;
                vm.thumbsWidth = 0;
                vm.thumbsPos = 0;
                vm.immersiveModeActive = false;

                vm.init = init;
                vm.initZoom = initZoom;
                vm.initThumbs = initThumbs;
                vm.largeImageLoaded = largeImageLoaded;

                vm.updateMainImage = updateMainImage;
                vm.nextThumb = nextThumb;
                vm.prevThumb = prevThumb;
                vm.disableImmersiveMode = disableImmersiveMode;

                function init()
                {
                    vm.options = !$scope.wipImageZoom ? defaultOpts : angular.extend(defaultOpts, $scope.wipImageZoom);

                    setImages();

                    $scope.selectedIndex = vm.options.defaultIndex;
                    $scope.selectedModel = vm.mainImage;
                }

                function setImages()
                {
                    if ( vm.options.images.length <= 0 )
                    {
                        vm.options.images = [
                            {
                                thumb : vm.attrs.src,
                                medium: vm.attrs.src,
                                large : vm.attrs.src
                            }
                        ];
                    }

                    vm.images = vm.options.images;
                    vm.mainImage = vm.images[vm.options.defaultIndex];
                }

                function update()
                {
                    // Debounce for update
                    if ( updateTimeout )
                    {
                        $timeout.cancel(updateTimeout);
                    }

                    updateTimeout = $timeout(function ()
                    {
                        initThumbs();
                        initZoom();
                        updateThumbsPos();
                    }, 400);
                }

                function initZoom()
                {
                    if ( !vm.options.zoomEnable )
                    {
                        return;
                    }

                    initSizes();

                    vm.zoomTracker.style.cursor = vm.options.cursor;

                    if ( vm.options.lens )
                    {
                        vm.zoomLens.style.display = 'block';
                    }
                    else
                    {
                        vm.zoomLens.style.display = 'none';
                    }

                    // Reset Event Listeners
                    removeEventListeners();

                    vm.immersiveModeActive = vm.options.immersiveMode && vm.options.immersiveMode > $window.innerWidth || vm.options.immersiveMode === 'always';

                    if ( vm.immersiveModeActive && !$scope.immersive )
                    {
                        vm.zoomTracker.addEventListener('mousedown', enableImmersiveMode);
                    }

                    if ( !vm.immersiveModeActive || $scope.immersive )
                    {
                        addEventListeners();
                    }

                }

                function addEventListeners()
                {
                    vm.zoomTracker.addEventListener('mousemove', zoomStateEnable);
                    vm.zoomTracker.addEventListener('touchstart', zoomStateEnable);

                    vm.zoomTracker.addEventListener('mouseleave', zoomStateDisable);
                    vm.zoomTracker.addEventListener('touchend', zoomStateDisable);

                    vm.zoomTracker.addEventListener('mousemove', setZoomImagePosition);
                    vm.zoomTracker.addEventListener('touchmove', setZoomImagePosition);
                }

                function removeEventListeners()
                {
                    vm.zoomTracker.removeEventListener('mousedown', enableImmersiveMode);

                    vm.zoomTracker.removeEventListener('mousemove', zoomStateEnable);
                    vm.zoomTracker.removeEventListener('touchstart', zoomStateEnable);

                    vm.zoomTracker.removeEventListener('mouseleave', zoomStateDisable);
                    vm.zoomTracker.removeEventListener('touchend', zoomStateDisable);

                    vm.zoomTracker.removeEventListener('mousemove', setZoomImagePosition);
                    vm.zoomTracker.removeEventListener('touchmove', setZoomImagePosition);
                }

                function disableImmersiveMode()
                {
                    $document.find('html').removeClass('wip-image-zoom-immersive-mode-enabled');
                    removeEventListeners();
                    vm.immersedEl.remove();
                    update();
                }

                function enableImmersiveMode(ev)
                {
                    ev.preventDefault();
                    ev.stopPropagation();
                    $scope.$apply(function ()
                    {
                        $document.find('html').addClass('wip-image-zoom-immersive-mode-enabled');
                        var body = $document.find('body').eq(0);
                        vm.immersedImageOpt = angular.extend(angular.copy(vm.options), vm.options.immersiveModeOptions);
                        vm.immersedImageOpt.defaultIndex = $scope.selectedIndex;
                        vm.immersedImageOpt.style = 'inner';
                        vm.immersedEl = $compile('<div class="immersive-wip-image-zoom">\n    <div class="disable-immersive-mode-button" ng-click="vm.disableImmersiveMode()">&#10006;</div>\n    <img src="" wip-image-zoom="vm.immersedImageOpt" immersive="true" selected-index="selectedIndex">\n</div>\n')($scope);
                        body.append(vm.immersedEl);
                        update();
                    });
                }

                function initThumbs()
                {
                    if ( vm.images.length <= 1 )
                    {
                        return;
                    }
                    vm.thumbsWrapperWidth = vm.thumbsWrapper.clientWidth;
                    vm.thumbWidth = Math.round((vm.thumbsWrapperWidth + vm.options.thumbColPadding) / vm.options.thumbCol);
                    vm.thumbsWidth = vm.thumbWidth * vm.images.length;
                    vm.maxPosX = vm.images.length - vm.options.thumbCol;

                    // Set Thumbnail width
                    $scope.$evalAsync(function ()
                    {
                        if ( vm.options.thumbsPos === 'top' )
                        {
                            vm.thumbsEl.style.paddingBottom = vm.options.thumbColPadding + 'px';
                            vm.thumbsEl.style.paddingTop = 0;
                        }
                        else
                        {
                            vm.thumbsEl.style.paddingTop = vm.options.thumbColPadding + 'px';
                            vm.thumbsEl.style.paddingBottom = 0;
                        }

                        for ( var i = 0; i < vm.thumbsEl.children.length; i++ )
                        {
                            var thumb = vm.thumbsEl.children[i];
                            thumb.style.width = vm.thumbWidth + 'px';
                            thumb.style.paddingRight = vm.options.thumbColPadding + 'px';
                        }
                    });
                }

                function nextThumb()
                {
                    scrollThumbs(vm.thumbsPos + 1);
                }

                function prevThumb()
                {
                    scrollThumbs(vm.thumbsPos - 1);
                }

                function scrollThumbs(newPosX)
                {
                    newPosX = newPosX < 0 ? 0 : newPosX;
                    newPosX = newPosX > vm.maxPosX ? vm.maxPosX : newPosX;
                    vm.thumbsPos = newPosX;
                    var scrollX = vm.thumbsPos * vm.thumbWidth * -1;
                    vm.thumbsEl.style.transform = 'translate3d(' + scrollX + 'px, 0px, 0)';
                }

                function initSizes()
                {
                    var tracker = vm.zoomTracker.getBoundingClientRect();
                    trackerW = tracker.width;
                    trackerH = tracker.height;
                    trackerL = tracker.left + $window.scrollX;
                    trackerT = tracker.top + $window.scrollY;
                    // Box Style
                    if ( vm.options.style === 'box' && !$scope.immersive )
                    {
                        maskW = vm.options.boxW;
                        maskH = vm.options.boxH;
                        vm.zoomMaskEl.style.width = maskW + 'px';
                        vm.zoomMaskEl.style.height = maskH + 'px';
                    }
                    // Inner Style
                    else
                    {
                        maskW = trackerW;
                        maskH = trackerH;
                        vm.zoomMaskEl.style.width = '100%';
                        vm.zoomMaskEl.style.height = '100%';
                    }

                    if ( vm.options.zoomLevel > 1 )
                    {
                        vm.zoomImageEl.style.width = trackerW * vm.options.zoomLevel + 'px';
                        vm.zoomImageEl.style.height = trackerH * vm.options.zoomLevel + 'px';
                    }

                    zoomImgW = vm.zoomImageEl.offsetWidth;
                    zoomImgH = vm.zoomImageEl.offsetHeight;

                    setLensSize();

                }

                function setZoomImagePosition(e)
                {
                    e.preventDefault();
                    var te = e.type === 'touchmove' && e.touches && e.touches[0];

                    evPosX = te && te.pageX || e.pageX;
                    evPosY = te && te.pageY || e.pageY;

                    setLensPosition();

                    if ( vm.options.method === 'lens' )
                    {
                        trackLens();
                    }
                    // pointer
                    else
                    {
                        trackPointer();
                    }

                }

                function trackLens()
                {
                    var posX = [(zoomImgW - maskW + lensW * 1 / zoomLevelRatio) * [(lensPosX / trackerW)]];
                    var posY = [(zoomImgH - maskH + lensH * 1 / zoomLevelRatio) * [lensPosY / trackerH]];
                    vm.zoomImageEl.style.transform = 'translate3d(' + posX * -1 + 'px,' + posY * -1 + 'px,0)';
                }

                function trackPointer()
                {
                    var posX = [(zoomImgW - maskW) * [(evPosX - trackerL) / trackerW]];
                    var posY = [(zoomImgH - maskH) * [(evPosY - trackerT) / trackerH]];

                    // Touch Fixes
                    posX = evPosX < trackerL ? 0 : posX;
                    posY = evPosY < trackerT ? 0 : posY;
                    posX = evPosX > trackerL + trackerW ? (zoomImgW - maskW) : posX;
                    posY = evPosY > trackerT + trackerH ? (zoomImgH - maskH) : posY;

                    vm.zoomImageEl.style.transform = 'translate3d(' + posX * -1 + 'px,' + posY * -1 + 'px,0)';
                }

                function setLensSize()
                {
                    zoomLevelRatio = trackerW / zoomImgW;
                    lensW = maskW * zoomLevelRatio;
                    lensH = maskH * zoomLevelRatio;
                    vm.zoomLens.style.width = lensW + 'px';
                    vm.zoomLens.style.height = lensH + 'px';
                }

                function setLensPosition()
                {
                    lensPosX = (evPosX - trackerL) - lensW * 0.5;
                    lensPosY = (evPosY - trackerT) - lensH * 0.5;

                    lensPosX = lensPosX > (trackerW - lensW) ? trackerW - lensW : lensPosX;
                    lensPosX = lensPosX < 0 ? 0 : lensPosX;

                    lensPosY = lensPosY > (trackerH - lensH) ? trackerH - lensH : lensPosY;
                    lensPosY = lensPosY < 0 ? 0 : lensPosY;

                    vm.zoomLens.style.transform = 'translate3d(' + lensPosX + 'px,' + lensPosY + 'px,0)';
                }

                function updateThumbsPos()
                {
                    if ( vm.images.length <= 1 )
                    {
                        return;
                    }
                    var selectedIndex = getSelectedIndex();
                    var isInView = vm.thumbsPos + vm.options.thumbCol > selectedIndex && vm.thumbsPos < selectedIndex;
                    if ( isInView )
                    {
                        scrollThumbs(vm.thumbsPos);
                        return;
                    }
                    scrollThumbs(selectedIndex);
                }

                function getSelectedIndex()
                {
                    for ( var i = 0; i < vm.images.length; i++ )
                    {
                        if ( vm.images[i].medium === vm.mainImage.medium )
                        {
                            return i;
                        }
                    }
                }

                function zoomStateEnable()
                {
                    $scope.$evalAsync(function ()
                    {
                        vm.zoomActive = true;
                    });
                }

                function zoomStateDisable()
                {
                    $scope.$evalAsync(function ()
                    {
                        vm.zoomActive = false;
                    });
                }

                function updateMainImage(image)
                {
                    vm.largeImageLoading = true;
                    vm.mainImage = image;
                    $scope.selectedModel = vm.mainImage;
                    $scope.selectedIndex = vm.images.indexOf(vm.mainImage);
                }

                function largeImageLoaded()
                {
                    vm.largeImageLoading = false;
                    initSizes();
                }

                $scope.$watch('selectedModel', function (newVal, oldVal)
                {
                    if ( angular.isDefined(newVal) && newVal !== oldVal )
                    {
                        vm.mainImage = newVal;
                        updateThumbsPos();
                    }
                }, true);

                $scope.$watch('selectedIndex', function (newVal, oldVal)
                {
                    if ( angular.isDefined(newVal) && newVal !== oldVal )
                    {
                        vm.mainImage = vm.images[newVal];
                        updateThumbsPos();
                    }
                }, true);

                angular.element(window).on('resize', function ()
                {
                    update();
                });

                if ( $window.Ps )
                {
                    angular.element(document).on('ps-scroll-y', function ()
                    {
                        initSizes();
                    });
                }

                $scope.$watch(function ()
                {
                    return {
                        left: vm.zoomTracker.getBoundingClientRect().left + $window.scrollX,
                        top : vm.zoomTracker.getBoundingClientRect().top + $window.scrollY
                    };
                }, function (newVal, oldVal)
                {
                    if ( angular.isDefined(newVal) && newVal !== oldVal )
                    {
                        update();
                    }
                }, true);

                $scope.$watch('wipImageZoom', function (newVal, oldVal)
                {
                    if ( angular.isDefined(newVal) && newVal !== oldVal )
                    {
                        init();
                        update();
                    }
                }, true);
            }]
        };
    }

    function wipImageZoomLensDirective()
    {
        return {
            restrict: 'EA',
            require : '^wipImageZoom',
            link    : function (scope, element, attrs, ctrl)
            {
                ctrl.zoomLens = element[0];
            }
        };
    }

    function wipImageZoomTrackerDirective()
    {
        return {
            restrict: 'EA',
            require : '^wipImageZoom',
            link    : function (scope, element, attrs, ctrl)
            {
                ctrl.zoomTracker = element[0];
            }
        };
    }

    function wipImageZoomMaskDirective()
    {
        return {
            restrict: 'EA',
            require : '^wipImageZoom',
            link    : function (scope, element, attrs, ctrl)
            {
                ctrl.zoomMaskEl = element[0];
            }
        };
    }

    function wipImageZoomImageDirective()
    {
        return {
            restrict: 'EA',
            require : '^wipImageZoom',
            link    : function (scope, element, attrs, ctrl)
            {
                ctrl.zoomImageEl = element[0];
            }
        };
    }

    function wipImageZoomThumbsDirective()
    {
        return {
            restrict: 'EA',
            require : '^wipImageZoom',
            template: '<div class="thumbs-wrapper" ng-swipe-left="vm.nextThumb()" ng-swipe-right="vm.prevThumb()">\n    <div class="thumbs" >\n        <div class="thumb-wrapper" ng-repeat="image in vm.images">\n            <img ng-src="{{image.thumb}}" ng-click="vm.updateMainImage(image)"\n                 ng-class="{\'selected\': vm.mainImage.thumb === image.thumb}">\n        </div>\n    </div>\n</div>\n<div class="prev-button"\n     ng-if="vm.thumbsPos !== 0"\n     ng-click="vm.prevThumb()"\n     ng-bind-html="vm.options.prevThumbButton">Prev\n</div>\n<div class="next-button"\n     ng-if="vm.thumbsPos !== vm.maxPosX"\n     ng-click="vm.nextThumb()"\n     ng-bind-html="vm.options.nextThumbButton">Next\n</div>',
            link    : function (scope, element, attrs, ctrl)
            {
                ctrl.thumbsWrapper = element[0].getElementsByClassName('thumbs-wrapper')[0];
                ctrl.thumbsEl = element[0].getElementsByClassName('thumbs')[0];
                ctrl.initThumbs();
            }
        };
    }

    function imageOnLoadDirective($log)
    {
        return {
            restrict: 'A',
            link    : function (scope, element, attrs)
            {
                element[0].addEventListener('load', function ()
                {
                    scope.$apply(attrs.imageOnLoad);
                }, false);
                element[0].addEventListener('error', function ()
                {
                    $log.warn('image could not be loaded');
                });
            }
        };
    }

})();
