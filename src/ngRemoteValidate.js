( function( angular ) {
    'use strict';
    if( !angular ) {
        throw 'Missing something? Please add angular.js to your project or move this script below the angular.js reference';
    }

    var directiveId = 'ngRemoteValidate',
        remoteValidate = function( $http, $timeout, $q ) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function( scope, el, attrs, ngModel ) {
                    var cache = {},
                        handleChange,
                        setValidation,
                        addToCache,
                        request,
                        shouldProcess,
                        options = {
                            ngRemoteThrottle: 400,
                            ngRemoteMethod: 'POST'
                        };

                    angular.extend( options, attrs );

                    if( options.ngRemoteValidate.charAt( 0 ) === '[' ) {
                        options.urls = eval( options.ngRemoteValidate );
                    } else {
                        options.urls = [ options.ngRemoteValidate ];
                    }

                    addToCache = function( response ) {
                        var value = response[ 0 ].data.value;
                        if ( cache[ value ] ) return cache[ value ];
                        cache[ value ] = response;
                    };

                    shouldProcess = function( value ) {
                        var otherRulesInValid = false;
                        for ( var p in ngModel.$error ) {
                            if ( ngModel.$error[ p ] && p != directiveId ) {
                                otherRulesInValid = true;
                                break;
                            }
                        }
                        return !( ngModel.$pristine || otherRulesInValid );
                    };

                    setValidation = function( response ) {
                        var i = 0,
                            l = response.length,
                            isValid = true;
                        for( ; i < l; i++ ) {
                            if( !response[ i ].data.isValid ) {
                                isValid = false;
                                break;
                            }
                        }
                        addToCache( response );
                        ngModel.$setValidity( directiveId, isValid );
                        el.removeClass( 'ng-processing' );
                    };

                    handleChange = function( value ) {
                        if( typeof value === 'undefined' ) return;

                        if ( !shouldProcess( value ) ) {
                            return setValidation( [ { data: { isValid: true, value: value } } ]);
                        }

                        if ( cache[ value ] ) {
                            return setValidation( cache[ value ] );
                        }

                        if ( request ) {
                            $timeout.cancel( request );
                        }

                        request = $timeout( function( ) {
                            el.addClass( 'ng-processing' );
                            var calls = [],
                                i = 0,
                                l = options.urls.length;
                            for( ; i < l; i++ ) {
                                calls.push( $http( { method: options.ngRemoteMethod, url: options.urls[ i ], data: { value: value } } ) );
                            }

                            $q.all( calls ).then( setValidation );
                            
                        }, options.ngRemoteThrottle );
                        return true;
                    };

                    scope.$watch( function( ) {
                        return ngModel.$viewValue;
                    }, handleChange );
                }
            };
        };

    angular.module( 'remoteValidation', [] )
           .constant('MODULE_VERSION', '##_version_##')
           .directive( directiveId, [ '$http', '$timeout', '$q', remoteValidate ] );
           
})( this.angular );