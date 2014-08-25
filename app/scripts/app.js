(function(window, $, undefined) {
  'use strict';

  window.addEventListener('Agave::ready', function() {
    var Agave = window.Agave;

    var help = $('.api-help');

    $.each(Agave.api.apisArray, function(i, api) {
      help.append($('<h4>').text(api.name));
      help.append($('<p>').text(api.description));
      help.append('<h5>Methods</h5>');
      var methods = $('<ul>');
      $.each(api.help(), function(i, m) {
        var method = $('<li>');
        method.append('<strong>' + m + '</strong>');
        var details = api[m.trim()].help();
        if (details) {
          method.append('<br>').append('Parameters');
          method.append('<p style="white-space:pre-line;">' + details + '</p>');
        }
        methods.append(method);
      });
      help.append(methods);
    });

    var info = $('.api-info');
    info.append('<p>' + Agave.api.info.title + ': ' + Agave.api.info.description + '</p>');
    info.append('<p><a href="mailto:' + Agave.api.info.contact + '">Contact</a> | <a href="' + Agave.api.info.license + '">License</a> | <a href="' + Agave.api.info.license + '">Terms of use</a></p>');


  });

})(window, jQuery);
