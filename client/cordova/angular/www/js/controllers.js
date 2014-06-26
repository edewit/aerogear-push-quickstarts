/*
 * JBoss, Home of Professional Open Source
 * Copyright Red Hat, Inc., and individual contributors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * 	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

angular.module('quickstart.controllers', [])

.controller('ContactsCtrl', function ($scope, contacts) {
  $scope.details = false;
  $scope.showDelete = false;
  contacts.query({}, function (data) {
    var first,
      length = data.length;
    $scope.groupedContacts = {};

    for (var i = 0; i < length; i++) {
      first = data[i].firstName.substring(0, 1).toUpperCase();
      if (!$scope.groupedContacts[first]) {
        $scope.groupedContacts[first] = [];
      }

      $scope.groupedContacts[first].push(data[i]);
    }
  });
  $scope.delete = function (contact) {
    contacts.delete({
      id: contact.id
    }, function () {
      var letter = contact.firstName.substring(0, 1).toUpperCase();
      $scope.groupedContacts[letter].splice($scope.groupedContacts[letter].indexOf(contact), 1);
      if ($scope.groupedContacts[letter].length === 0) {
        delete $scope.groupedContacts[letter];
      }
      $scope.showDelete = false;
    });
  };
})

.controller('ContactCtrl', function ($scope, $stateParams, contacts, $location, $ionicModal) {
  if ($stateParams.id) {
    contacts.get({
      id: $stateParams.id
    }, function (contact) {
      $scope.model = contact;
    });
  }
  $scope.save = function (contact) {
    console.log(contact);
    var self = this;
    if ($stateParams.id) {
      contacts.update(contact, onSuccess, onFailure);
    } else {
      contacts.save(contact, onSuccess);
    }

    function onSuccess() {
      $location.url('/app/contacts');
    }
    
    function onFailure(e) {
      if (e.status === 409) {
        $ionicModal.fromTemplateUrl('templates/diff.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal) {
          $scope.data = JSON.stringify(e.data, null, 4);
          $scope.model = angular.toJson(contact, 4);
          modal.show();
          
          $scope.cancel = function() {
            modal.hide();
            $location.url('/app/contacts/');
          }

          $scope.override = function() {
            console.log(contact);
            contact.version = e.data.version;
            contacts.update(contact, onSuccess, onFailure);
          }          
        });
      }
    }
  };
})

.controller('LoginCtrl', function ($scope, $location, authz, users) {
  $scope.login = function (user) {
    authz.setCredentials(user.name, user.password);
    users.login({}, function () {
      $location.url('/app/contacts');
    });
  };
  $scope.signup = function (data) {
    users.register(data, function () {
      $location.url('/app/login');
    });
  };
  $scope.logout = function () {
    users.logout({}, function () {
      $location.url('/app/login');
    });
  };

  $scope.dismissAlert = function(id) {
    delete $scope.notification;
    if (id) {
      $location.url('/app/contact/' + id);
    }
  };
  $scope.$on('notification', function (scope, event) {
    $scope.notification = event;
    $scope.$apply();
    //event.payload. event.alert
  });
});