angular.module('todo', ['ionic', 'firebase'])
/**
 * The Projects factory handles saving and loading projects
 * from local storage, and also lets us save and load the
 * last active project index.
 */
.factory('Projects', function() {
  return {
    all: function() {
      var projectString = window.localStorage['projects'];
      if(projectString) {
        return angular.fromJson(projectString);
      }
      return [];
    },
    save: function(projects) {
      window.localStorage['projects'] = angular.toJson(projects);
    },
    newProject: function(projectTitle) {
      // Add a new project
      return {
        title: projectTitle,
        tasks: []
      };
    },
    getLastActiveIndex: function() {
      return parseInt(window.localStorage['lastActiveProject']) || 0;
    },
    setLastActiveIndex: function(index) {
      window.localStorage['lastActiveProject'] = index;
    }
  }
})

.controller('TodoCtrl', function($scope, $firebase, $timeout, Modal, Projects) {
  $scope.projectsList = {};
  $scope.user = {};
  
  $scope.projectsList = $firebase(new Firebase("https://cordova.firebaseio.com/projects"));
  $scope.user = $firebase (new Firebase("https://cordova.firebaseio.com/users/John"));
  
  $scope.projectsList.$on("loaded", function(){
    console.log($scope.projectsList);
    window.projectsList = $scope.projectsList;
  });
  
  $scope.projectsList.$on("loaded", function(){
    console.log($scope.user);
    window.user = $scope.user;
  });
  
  // A utility function for creating a new project
  // with the given projectTitle
  var createProject = function(projectTitle) {
    // var newProject = Projects.newProject(projectTitle);
    // $scope.projects.push(newProject);
    
    $scope.projectsList[projectTitle] = [];
    $scope.projectsList.$save(projectTitle);
    
    // Projects.save($scope.projects);
    //$scope.selectProject(newProject, $scope.projects.length-1);
    $scope.selectProject(projectTitle);
  }


  // Load or initialize projects
  // $scope.projects = Projects.all();

  // Grab the last active, or the first project
  // $scope.activeProject = $scope.projects[Projects.getLastActiveIndex()];

  // Called to create a new project
  $scope.newProject = function() {
    var projectTitle = prompt('Project name');
    if(projectTitle) {
      createProject(projectTitle);
    }
  };

  // Called to select the given project
  $scope.selectProject = function(project) {
    //$scope.activeProject = project;
    //Projects.setLastActiveIndex(index);
    $scope.user.lastproject = project;
    
    $scope.sideMenuController.close();
  };

  // Create our modal
  Modal.fromTemplateUrl('new-task.html', function(modal) {
    $scope.taskModal = modal;
  }, {
    scope: $scope
  });

  $scope.createTask = function(task) {
   /* if(!$scope.activeProject) {
      return;
    }*/
    
    if(!$scope.user.lastproject) {
      return;
    }
    
    var name = $scope.user.lastproject;
    $scope.projectsList[name].push(task.title);
    $scope.projectsList.$save(name);
    $scope.taskModal.hide();
    
    task.title = "";
  };

  $scope.newTask = function() {
    $scope.taskModal.show();
  };

  $scope.closeNewTask = function() {
    $scope.taskModal.hide();
  }

  $scope.toggleProjects = function() {
    $scope.sideMenuController.toggleLeft();
  };

});
