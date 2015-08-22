angular.module('morphCarousel', [])


  /**
   * Morph carousel directive
   * @example
   * $scope.items = [1, 2, 3, 4, 5, 6]
   * $scope.select = function() {}
   *
   * <morph-carousel
   *      data-items="items"
   *      selected-item="selectedItem"
   *      show-value="value"></morph-carousel>
   *
   * @attributes
   * data-items {array} - array of items that should be shown in carousel
   * selected-item {*} - will contain selected item
   * show-value {string} - (optional) if array of items contain objects this property will determine what value of the object will be shown in carousel
   */
  .directive('morphCarousel', ['$ionicGesture', '$timeout',
    function($ionicGesture, $timeout){

      var link = function(scope, el, attr) {
        var angleRad,
          currentAngle,
          itemWidth,
          radius;

        // current position of carousel rotation
        var carouselRotateAngle = 0;

        var isDragging = false;

        var minRotateAngle = 360 / scope.items.length;

        // Angle (half of it) in radians
        angleRad = (minRotateAngle / 2) * Math.PI / 180;

        radius = el[0].offsetWidth / 2;

        itemWidth = radius * Math.sin(angleRad) * 2;

        $timeout(function(){
          if ( scope.items.length > 0 ) {
            el[0].style.height = el[0].getElementsByClassName('morph-carousel__item')[0].offsetHeight + 'px';
          }
        }, 50);

        if ( scope.selectedItem ) {
          for ( var i=0, len=scope.items.length; i<len; i++ ) {
            if ( angular.equals( scope.selectedItem, scope.items[i] ) ) {
              var angle = 360 - i * minRotateAngle;
              scope.carouselRotation = 'rotateY('+ angle +'deg)';
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
          setRotation( currentAngle );
        }, el);

        $ionicGesture.on('dragend', function (ev) {
          var velocity = 0;
          var acceleration = 1.9;
          isDragging = false;
          currentAngle = stabilizeAngle( currentAngle );
          setRotation( currentAngle );
          carouselRotateAngle = currentAngle;
          switch( ev.gesture.direction ) {
            case 'left':
              velocity = ev.gesture.velocityX * acceleration;
              break;
            default:
              velocity = -1 * ev.gesture.velocityX * acceleration;
          }
          finishAnimation(velocity);
        }, el);

        scope.getItemWidth = function() { return itemWidth + 'px' };

        scope.getItemRotation = function( i ) {
          return 'rotateY('+ i * minRotateAngle +'deg) translateZ('+ radius +'px)';
        };

        scope.getItemValue = function(item) {
          if ( !! scope.showValue )
            return item[scope.showValue];
          else
            return item
        };

        /**
         * Ending movement of the carousel animation
         *
         * @param velocity
         */
        function finishAnimation( velocity ) {
          var direction = velocity < 0 ? 1 : -1;
          var endAngle = stabilizeAngle( Math.abs(velocity) * minRotateAngle );
          var angle = 0;
          var currentAngle = 0;
          var last = +new Date();
          var speed = 500; // how much time will take animation
          var tick = function() {

            if ( isDragging ) return false;

            angle += direction * endAngle * (new Date() - last) / speed;
            last = +new Date();
            currentAngle = carouselRotateAngle + angle;
            setRotation( currentAngle );

            if (Math.abs(angle) < endAngle) {
              (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
            } else {
              var itemIndex;
              currentAngle = stabilizeAngle( currentAngle );
              setRotation( currentAngle );
              carouselRotateAngle = currentAngle;

              itemIndex = normalizeAngle(carouselRotateAngle) /minRotateAngle;
              itemIndex = itemIndex > 0 ? 360 / minRotateAngle - itemIndex : itemIndex;
              if (!scope.$$phase) {
                scope.$apply(function(){
                  scope.selectedItem = scope.items[itemIndex];
                });
              } else {
                scope.selectedItem = scope.items[itemIndex];
              }
            }
          }.bind(this);
          tick()
        }

        function setRotation(angle) {
          scope.$apply(function(){
            scope.carouselRotation = 'rotateY('+ angle +'deg)';
          });
        }

        /**
         * Stabilize given angle to the closest one, based on minRotateAngle
         * @param angle
         * @returns {number}
         */
        function stabilizeAngle( angle ) {
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
        function normalizeAngle( angle ) {
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
      }

      return {
        restrict: 'E',
        scope: {
          items: '=',
          selectedItem: '=onSelected',
          showValue: '@'
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
    }]);
