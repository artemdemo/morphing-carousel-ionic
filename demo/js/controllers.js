angular.module('starter.controllers', [])

.controller('DashCtrl',
    function($scope) {
        $scope.items = [
            { number: 1 },
            { number: 2 },
            { number: 3 },
            { number: 4 },
            { number: 5 },
            { number: 6 },
            { number: 7 }
        ];

        $scope.data = {
            selectedItem: $scope.items[2]
        };

        $scope.$watch('data.selectedItem', function(newValue){
            console.log(newValue);
        });

    })

.controller('ModalCtrl',
    function($scope, $ionicModal, $morphCarousel) {

        $scope.items = [
            { letter: 'a' },
            { letter: 'b' },
            { letter: 'c' },
            { letter: 'd' },
            { letter: 'e' },
            { letter: 'f' },
            { letter: 'g' },
            { letter: 'h' },
            { letter: 'i' },
            { letter: 'j' },
            { letter: 'k' },
            { letter: 'l' },
            { letter: 'm' },
            { letter: 'n' },
            { letter: 'o' }
        ];

        $scope.selectedItem = $scope.items[4];

        $ionicModal.fromTemplateUrl('templates/tpl-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
        });

        $scope.openModal = function() {
            $scope.modal.show();
            $morphCarousel.update('modal-carousel');
        };

        $scope.closeModal = function() {
            $scope.modal.hide();
        };

    })

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
    $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
    $scope.settings = {
        enableFriends: true
    };
});
