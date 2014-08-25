(function(window, $, undefined) {
  'use strict';

  window.addEventListener('Agave::ready', function() {
    var Agave, help, helpItem, helpDetail, methods, methodDetail;

    Agave = window.Agave;

    help = $('.api-help');

    $.each(Agave.api.apisArray, function(i, api) {
      helpItem = $('<a class="list-group-item">');
      help.append(helpItem);

      helpItem.append($('<h4>').text(api.name).append('<i class="pull-right fa fa-toggle-up"></i>'));
      helpDetail = $('<div class="api-help-detail">');
      helpDetail.append($('<p>').text(api.description));
      helpDetail.append('<h5>Methods</h5>');
      methods = $('<ul>');
      $.each(api.help(), function(i, m) {
        methodDetail = $('<li>');
        methodDetail.append('<strong>' + m + '</strong>');
        var details = api[m.trim()].help();
        if (details) {
          methodDetail.append('<br>').append('Parameters');
          methodDetail.append('<p style="white-space:pre-line;">' + details + '</p>');
        }
        methods.append(methodDetail);
      });
      helpDetail.append(methods);
      helpItem.append(helpDetail.hide());
    });

    $('.api-help > a').on('click', function() {
      if (! $(this).hasClass('list-group-item-info')) {
        // close other
        $('.api-help > a.list-group-item-info').removeClass('list-group-item-info').find('.fa').toggleClass('fa-toggle-up fa-toggle-down').end().find('.api-help-detail').slideToggle();
      }

      $(this).toggleClass('list-group-item-info');
      $('.fa', this).toggleClass('fa-toggle-up fa-toggle-down');
      $('.api-help-detail', this).slideToggle();
    });

    var info = $('.api-info');
    info.addClass('text-center');
    info.append('<p>' + Agave.api.info.title + ': ' + Agave.api.info.description + '</p>');
    info.append('<p><a href="mailto:' + Agave.api.info.contact + '">Contact</a> | <a href="' + Agave.api.info.license + '">License</a> | <a href="' + Agave.api.info.license + '">Terms of use</a></p>');


  });

})(window, jQuery);
