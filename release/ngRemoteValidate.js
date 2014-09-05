( function( angular ) {
    'use strict';
    if( !angular ) {
        throw 'Missing something? Please add angular.js to your project or move this script below the angular.js reference';
    }

    var directiveId = 'ngRemoteValidate',
        remoteValidate = function( $http, $timeout, $q ) {
            return {
                restrict: 'A',
                require: [ '^form','ngModel' ],
                link: function( scope, el, attrs, ctrls ) {
                    var cache = {},
                        handleChange,
                        setValidation,
                        addToCache,
                        request,
                        shouldProcess,
                        ngForm = ctrls[ 0 ],
                        ngModel = ctrls[ 1 ],
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

                    setValidation = function( response, skipCache ) {
                        var i = 0,
                            l = response.length,
                            isValid = true;
                        for( ; i < l; i++ ) {
                            if( !response[ i ].data.isValid ) {
                                isValid = false;
                                break;
                            }
                        }
                        if( !skipCache ) {
                            addToCache( response );    
                        }
                        ngModel.$setValidity( directiveId, isValid );
                        ngModel.$processing = ngModel.$pending = ngForm.$pending = false;
                    };

                    handleChange = function( value ) {
                        if( typeof value === 'undefined' || value === '' ) {
                            ngModel.$setPristine();
                            return;
                        };

                        if ( !shouldProcess( value ) ) {
                            return setValidation( [ { data: { isValid: true, value: value } } ], true );
                        }

                        if ( cache[ value ] ) {
                            return setValidation( cache[ value ], true );
                        }
                        
                        //Set processing now, before the delay. 
                        //Check first to reduce dom updates
                        if( !ngModel.$pending ) {
                            ngModel.$processing = ngModel.$pending = ngForm.$pending = true;
                        }
                        
                        if ( request ) {
                            $timeout.cancel( request );
                        }

                        request = $timeout( function( ) {
							var calls = [],
                                i = 0,
                                l = options.urls.length,
                                toValidate = { value: value },
                                httpOpts = { method: options.ngRemoteMethod };
                            
                            if ( scope[ el[0].name + 'SetArgs' ] ) {
                                toValidate = scope[el[0].name + 'SetArgs'](value, el, attrs, ngModel);
                            }

                            if(options.ngRemoteMethod == 'POST'){
                                httpOpts.data = toValidate;
                            } else {
                                httpOpts.params = toValidate;
                            }

                            for( ; i < l; i++ ) {
                                httpOpts.url =  options.urls[ i ];
                                calls.push( $http( httpOpts ) );
                            }

                            $q.all( calls ).then( setValidation );
                            
                        }, options.ngRemoteThrottle );
                        return true;
                    };

                    //ngModel.$parsers.unshift( handleChange );
                    scope.$watch( function( ) {
                        return ngModel.$viewValue;
                    }, handleChange );
                }
            };
        };

    angular.module( 'remoteValidation', [] )
           .constant('MODULE_VERSION', '0.4.1')
           .directive( directiveId, [ '$http', '$timeout', '$q', remoteValidate ] );
           
})( this.angular );