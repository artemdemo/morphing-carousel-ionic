angular.module('morphCarousel', [])

/**
 * Morph carousel directive
 * @example
 * $scope.items = [1, 2, 3, 4, 5, 6]
 *
 * <morph-carousel
 *      data-items="items"
 *      selected-item="selectedItem"
 *      identifier="carousel-name"
 *      show-value="value"></morph-carousel>
 *
 * @attributes
 * data-items {array} - array of items that should be shown in carousel
 * selected-item {*} - will contain selected item
 * identifier {*} - (optional) used to identify this morphCarousel with $morphCarousel factory
 * show-value {string} - (optional) if array of items contain objects this property will determine what value of the object will be shown in carousel
 */
.directive('morphCarousel', ['$ionicGesture', '$timeout', '$morphCarousel',
    function ($ionicGesture, $timeout, $morphCarousel) {

        var link = function (scope, el, attr) {
            var currentAngle,
                itemWidth,
                radius;

            // current position of carousel rotation
            var carouselRotateAngle = 0;

            var isDragging = false;

            var minRotateAngle = 360 / scope.items.length;

            radius = el[0].offsetWidth / 2;

            itemWidth = $morphCarousel.$getItemWidth(scope.items.length, radius);

            $timeout(function () {
                if (scope.items.length > 0) {
                    el[0].style.height = el[0].getElementsByClassName('morph-carousel__item')[0].offsetHeight + 'px';
                }
            }, 50);

            if (!!scope.identifier) {
                $morphCarousel.$addEl(scope.identifier, el);
            }

            if (scope.selectedItem) {
                for (var i = 0, len = scope.items.length; i < len; i++) {
                    if (angular.equals(scope.selectedItem, scope.items[i])) {
                        var angle = 360 - i * minRotateAngle;
                        scope.carouselRotation = 'rotateY(' + angle + 'deg)';
                        break;
                    }
                }
            } else {
                scope.carouselRotation = 'rotateY(0deg)';
            }

            $ionicGesture.on('drag', function (ev) {
                var len = Math.ceil(scope.items.length / 2);
                currentAngle = carouselRotateAngle + ev.gesture.deltaX / el[0].offsetWidth * ( minRotateAngle * len );
                isDragging = true;
                setRotation(currentAngle);
            }, el);

            $ionicGesture.on('dragend', function (ev) {
                var velocity = 0;
                var acceleration = 1.9;
                isDragging = false;
                currentAngle = stabilizeAngle(currentAngle);
                setRotation(currentAngle);
                carouselRotateAngle = currentAngle;
                switch (ev.gesture.direction) {
                    case 'left':
                        velocity = ev.gesture.velocityX * acceleration;
                        break;
                    default:
                        velocity = -1 * ev.gesture.velocityX * acceleration;
                }
                finishAnimation(velocity);
            }, el);

            scope.getItemWidth = function () {
                return itemWidth + 'px'
            };

            scope.getItemRotation = function (i) {
                return 'rotateY(' + i * minRotateAngle + 'deg) translateZ(' + radius + 'px)';
            };

            scope.getItemValue = function (item) {
                if (!!scope.showValue)
                    return item[scope.showValue];
                else
                    return item
            };

            /**
             * Ending movement of the carousel animation
             *
             * @param velocity
             */
            function finishAnimation(velocity) {
                var direction = velocity < 0 ? 1 : -1;
                var endAngle = stabilizeAngle(Math.abs(velocity) * minRotateAngle);
                var angle = 0;
                var currentAngle = 0;
                var last = +new Date();
                var speed = 500; // how much time will take animation
                var tick = function () {

                    if (isDragging) return false;

                    angle += direction * endAngle * (new Date() - last) / speed;
                    last = +new Date();
                    currentAngle = carouselRotateAngle + angle;
                    setRotation(currentAngle);

                    if (Math.abs(angle) < endAngle) {
                        (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
                    } else {
                        var itemIndex;
                        currentAngle = stabilizeAngle(currentAngle);
                        setRotation(currentAngle);
                        carouselRotateAngle = currentAngle;

                        itemIndex = normalizeAngle(carouselRotateAngle) / minRotateAngle;
                        itemIndex = itemIndex > 0 ? 360 / minRotateAngle - itemIndex : itemIndex;
                        if (!scope.$$phase) {
                            scope.$apply(function () {
                                scope.selectedItem = scope.items[Math.floor(itemIndex)];
                            });
                        } else {

                            scope.selectedItem = scope.items[Math.floor(itemIndex)];
                        }
                    }
                }.bind(this);
                tick()
            }

            function setRotation(angle) {
                scope.$apply(function () {
                    scope.carouselRotation = 'rotateY(' + angle + 'deg)';
                });
            }

            /**
             * Stabilize given angle to the closest one, based on minRotateAngle
             * @param angle
             * @returns {number}
             */
            function stabilizeAngle(angle) {
                var mod = Math.floor(angle / minRotateAngle),
                    angleF = mod * minRotateAngle,
                    angleS = angleF + minRotateAngle;
                switch (true) {
                    case angle - angleF > angleS - angle:
                        return angleS;
                    default:
                        return angleF;
                }
            }

            /**
             * Normalize angle into range between 0 and 360. Converts invalid angle to 0.
             * @param angle
             * @returns {number}
             */
            function normalizeAngle(angle) {
                var result;
                if (angle == null) {
                    angle = 0;
                }
                result = isNaN(angle) ? 0 : angle;
                result %= 360;
                if (result < 0) {
                    result += 360;
                }
                return result;
            }
        };

        return {
            restrict: 'E',
            scope: {
                items: '=',
                selectedItem: '=onSelected',
                showValue: '@',
                identifier: '@'
            },
            template: [
                '<div class="morph-carousel-container">',
                '<div class="morph-carousel__shadow"></div>',
                '<div class="morph-carousel-stage">',
                '<div class="morph-carousel" style="width: {{ ::getItemWidth() }}" ' +
                'ng-style="{\'-webkit-transform\': carouselRotation, \'transform\': carouselRotation}">',
                '<div class="morph-carousel__item" ' +
                'style="width: {{ ::getItemWidth() }}; -webkit-transform: {{ ::getItemRotation($index) }}; transform: {{ ::getItemRotation($index) }}" ' +
                'ng-repeat="item in ::items">{{ ::getItemValue(item) }}</div>',
                '</div>',
                '<div class="morph-carousel__separator"></div>',
                '</div>',
                '</div>'
            ].join(''),
            link: link
        }
    }])

/**
 * Morphing carousel factory to provide model layer for carousel directives
 */
.factory('$morphCarousel', [function () {
    var $morphCarousel = {};

    var carouselElements = [];

    /**
     * Get carousel el by it's id
     * @param id
     * @returns {*}
     */
    var getElbyId = function (id) {
        for (var i = 0, len = carouselElements.length; i < len; i++) {
            if (id == carouselElements[i].id)
                return carouselElements[i].el
        }
        return false;
    };

    /**
     * Calculate item width
     * @param itemsAmount {number}
     * @param radius {number}
     * @returns {number}
     */
    $morphCarousel.$getItemWidth = function (itemsAmount, radius) {
        var minRotateAngle, angleRad;

        minRotateAngle = 360 / itemsAmount;

        // Angle (half of it) in radians
        angleRad = (minRotateAngle / 2) * Math.PI / 180;

        return radius * Math.sin(angleRad) * 2;
    };

    /**
     * Add carousel element to the list
     * Will return true if successfully added, if element already exist in list it wouldn't be added
     * @param id
     * @param el
     * @returns {boolean}
     */
    $morphCarousel.$addEl = function (id, el) {
        console.log('getElbyId(id) ', getElbyId(id));
        if (!getElbyId(id)) {
            carouselElements.push({
                id: id,
                el: el
            });
            return true;
        }
        return false;
    };

    /**
     * Update carousel by it's identifier
     * @param id
     */
    $morphCarousel.update = function (id) {
        var carouselEl = getElbyId(id),
            items,
            radius,
            itemWidth,
            minRotateAngle;

        if (!carouselEl) return false;

        items = carouselEl[0].getElementsByClassName('morph-carousel__item');

        radius = carouselEl[0].offsetWidth / 2;

        minRotateAngle = 360 / items.length;

        itemWidth = $morphCarousel.$getItemWidth(
            items.length,
            radius
        );

        carouselEl[0].getElementsByClassName('morph-carousel')[0].style.width = itemWidth + 'px';

        for (var i = 0, len = items.length; i < len; i++) {
            items[i].style.width = itemWidth + 'px';
            items[i].style.transform = 'rotateY(' + i * minRotateAngle + 'deg) translateZ(' + radius + 'px)';
        }

        carouselEl[0].style.height = items[0].offsetHeight + 'px';

    };

    return $morphCarousel;
}]);
