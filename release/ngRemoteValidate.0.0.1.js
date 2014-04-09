( function( angular ) {
    'use strict';
    if( !angular ) {
        throw 'Missing something? Please add angular.js to your project or move this script below the angular.js reference';
    }

    var dirictiveId = 'ngRemoteValidate',
        remoteValidate = function( $http, $timeout ) {

            return {
                restrict: 'A',
                require: 'ngModel',
                link: function( scope, el, attrs, ngModel ) {
                    var cache = {},
                        handleChange,
                        setValidation,
                        addToCache,
                        originalValue,
                        request,
                        shouldProcess,
                        options = {
                            ngRemoteThrottle: 400,
                            ngRemoteMethod: 'POST'
                        };

                    angular.extend( options, attrs );

                    addToCache = function( data ) {
                        if ( cache[ data.value ] ) return;
                        cache[ data.value ] = data.valid;
                    };

                    shouldProcess = function( value ) {
                        var otherRulesInValid = false;
                        for ( var p in ngModel.$error ) {
                            if ( ngModel.$error[ p ] && p != dirictiveId ) {
                                otherRulesInValid = true;
                                break;
                            }
                        }
                        return !( ngModel.$pristine || value === originalValue || otherRulesInValid );
                    };

                    setValidation = function( data ) {
                        ngModel.$setValidity( dirictiveId, data.isValid );
                        addToCache( data );
                        el.removeClass( 'ng-processing' );
                    };

                    handleChange = function( value ) {

                        originalValue = originalValue || value;

                        if ( !shouldProcess( value ) ) {
                            return setValidation( { isValid: true, value: value } );
                        }

                        if ( cache[ value ] ) {
                            return setValidation( cache[ value ] );
                        }

                        if ( request ) {
                            $timeout.cancel( request );
                        }

                        request = $timeout( function( ) {
                            el.addClass( 'ng-processing' );
                            $http( { method: options.ngRemoteMethod, url: options.ngRemoteValidate, data: { value: value } } ).success( setValidation );
                        }, options.ngRemoteThrottle );
                        return true;
                    };

                    scope.$watch( function( ) {
                        return ngModel.$viewValue;
                    }, handleChange );
                }
            };
        };

    angular.module( 'remoteValidation' )
           .constant('MODULE_VERSION', '0.0.1')
           .directive( dirictiveId, [ '$http', '$timeout', remoteValidate ] );
           
})( this.angular );

