app.directive('modal', function () {
    return {
      template: '<div class="modal fade">' + 
          '<div class="modal-dialog">' + 
            '<div class="modal-content">' + 
              '<div class="modal-header">' +
              '<div ng-show="loc"><p  style="font-family:courier;font-size:2em">location found</p><button data-dismiss="modal" class="btn btn-warning btn-md">Continue</button></div>'+
              '<div ng-show="!loc"><p  style="font-family:courier;font-size:2em">location not found</p><button ng-click="goanonymous()" data-dismiss="modal" class="btn btn-warning btn-md">Go anonymous</button></div>'+
                 
                '' + 
              '</div>' + 
              '<div class="modal-body" ng-transclude></div>' + 
            '</div>' + 
          '</div>' + 
        '</div>',
      restrict: 'E',
      transclude: true,
      replace:true,
      scope:true,
      link: function postLink(scope, element, attrs) {
          scope.$watch(attrs.visible, function(value){
          if(value == true)
            $(element).modal('show');
          else
            $(element).modal('hide');
        });

        $(element).on('hidden.bs.modal', function(){
          scope.$apply(function(){
            scope.$parent[attrs.visible] = false;
          });
        });
      }
    };
  });
