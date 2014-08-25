/*globals jQuery, SwaggerApi, ApiKeyAuthorization*/
(function(window, $, SwaggerApi, ApiKeyAuthorization, undefined){
  'use strict';
  var Agave, authTokenNew, authTokenRefresh, authTokenPost,
    agaveApiInit, showToken, appRunnerInit;

  Agave = window.Agave = window.Agave || {};

  authTokenNew = function authTokenGet(username, password) {
    var data = 'grant_type=password&scope=PRODUCTION&username=' + username + '&password=' + password;
    return authTokenPost(data);
  };

  authTokenRefresh = function authTokenRefresh(refreshToken) {
    var data = 'grant_type=refresh_token&scope=PRODUCTION&refresh_token=' + refreshToken;
    return authTokenPost(data);
  };

  authTokenPost = function authTokenPost(data) {
    var agaveClient;

    try {
      agaveClient = JSON.parse(window.localStorage.getItem('agaveClient'));
    } catch (e) {
      console.log(e);
      return;
    }

    var promise = $.ajax({
      url: 'https://api.araport.org/token',
      type: 'post',
      data: data,
      headers: {
        Authorization: 'Basic ' + btoa(agaveClient.consumerKey + ':' + agaveClient.consumerSecret)
      }
    });

    promise.done(function(resp) {
      /* current time to detect token expiration */
      resp.created = Date.now();

      /* store token */
      window.localStorage.setItem('agaveToken', JSON.stringify(resp));

      /* set token for use */
      Agave.oauth2 = resp;
    });

    return promise;
  };

  agaveApiInit = function agaveApiInit() {
    window.authorizations.add('Authorization', new ApiKeyAuthorization('Authorization', 'Bearer ' + Agave.oauth2.access_token, 'header'));
    Agave.api = new SwaggerApi({
      url: '//' + window.location.host + '/resources',
      success: function() {
        if (Agave.api.ready === true) {
          console.log('AgaveAPI bootstrapped!');
          window.dispatchEvent(new CustomEvent('Agave::ready', undefined));
        }
      }
    });
  };

  showToken = function showToken() {
    $('.current-token').html('<p>Value: <span class="label label-success">'+ Agave.oauth2.access_token +'</span> Expires: ' + new Date(Agave.oauth2.created + (1000 * Agave.oauth2.expires_in)).toLocaleString() + '</p>');
    $('.api-credentials .token-form').hide();
  };

  appRunnerInit = function apiInit() {
    var agaveClient, form, agaveToken;

    agaveClient = window.localStorage.getItem('agaveClient');
    if (agaveClient) {
      form = $('form[name=agaveApiTokenForm]');
      try {
        agaveClient = JSON.parse(agaveClient);
        $.each(agaveClient, function(key, value) {
          $('[name='+key+']', form).val(value);
        });
      } catch (err) {
        console.log(err);
      }
    }

    agaveToken = window.localStorage.getItem('agaveToken');
    if (agaveToken) {
      try {
        agaveToken = JSON.parse(agaveToken);
        if (Date.now() - agaveToken.created < (1000 * agaveToken.expires_in)) {
          Agave.oauth2 = agaveToken;
          agaveApiInit();
          showToken();
        } else {
          /* attempt refreshToken */
          authTokenRefresh(agaveToken.refresh_token).done(function() {
            Agave.oauth2 = agaveToken;
            agaveApiInit();
            showToken();
          });
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  /* events */
  $('button[name=toggleTokenForm]').on('click', function() {
    $('.api-credentials .token-form').toggle();
  });

  $('form[name=agaveApiTokenForm]').on('submit', function(e) {
    e.preventDefault();

    var form = $(this);

    var agaveClient = {
      consumerKey: form[0].consumerKey.value,
      consumerSecret: form[0].consumerSecret.value
    };

    window.localStorage.setItem('agaveClient', JSON.stringify(agaveClient));

    authTokenNew(
      form[0].username.value,
      form[0].password.value
    ).done(function(resp) {
      Agave.oauth2 = resp;
      agaveApiInit();
      showToken();
    });
  });

  $('button[name=agaveApiTokenFormClear]').on('click', function() {
    if ( window.confirm( 'Are you sure you want to clear your API credentials?' ) ) {
      window.localStorage.clear();
      window.location.reload();
    }
  });

  /* GO! */
  appRunnerInit();

})(window, jQuery, SwaggerApi, ApiKeyAuthorization);
