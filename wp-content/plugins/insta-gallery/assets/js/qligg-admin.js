(function ($) {

  $.fn.serializeArrayAll = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
      if (o[this.name] !== undefined) {
        if (!o[this.name].push) {
          o[this.name] = [o[this.name]];
        }
        o[this.name].push(this.value || '');
      } else {
        o[this.name] = this.value || '';
      }
    });
    var $radio = $('input[type=radio],input[type=checkbox]', this);
    $.each($radio, function () {
      if (!o.hasOwnProperty(this.name)) {
        o[this.name] = '';
      }
    });
    return o;
  };

  $(document).on('ready', function () {

    // by username/tag toggle
    $('input[name="ig_select_from"]').on('change', function () {
      if (this.value == 'username') {
        $('#ig-select-tag-wrap').hide(500, function () {
          $('#ig-select-username-wrap').show( ).addClass('active');
        }).removeClass('active');
      } else {
        $('#ig-select-username-wrap').hide(500, function () {
          $('#ig-select-tag-wrap').show( ).addClass('active');
        }).removeClass('active');
      }
    });

    // gallery, carousel toggle
    $('input[name="ig_display_type"]').on('change', function () {

      if (this.value == 'gallery') {
        $('#ig-section-as-carousel').hide(500, function () {
          $('#ig-section-as-galllery').show(  ).addClass('active');
        }).removeClass('active');
      } else if (this.value == 'carousel') {
        $('#ig-section-as-galllery').hide(500, function () {
          $('#ig-section-as-carousel').show( ).addClass('active');
        }).removeClass('active');
      }

    });

    // gallery color sync
    $('#insta_hover-color-choose').on('change', function () {
      $('input[name="insta_hover-color"]').val($(this).val());
    });
    $('input[name="insta_hover-color"]').on('change', function () {
      var hvcolor = $(this).val();
      if (hvcolor != '') {
        var isOk = /^#[0-9A-F]{6}$/i.test(hvcolor);
        if (!isOk) {
          alert('please enter valid color code');
          $(this).val('');
          return;
        }
        $('#insta_hover-color-choose').val($(this).val());
      } else {
        $('#insta_hover-color-choose').val('#007aff');
      }
    });

    // instagram link button toggle
    $('input[name="insta_instalink"]').on('change', function () {
      if (this.checked) {
        $('#ig-section-igbtn').show('slow').addClass('active');
      } else {
        $('#ig-section-igbtn').hide('slow').removeClass('active');
      }
    });

    // nav arrows color sync
    $('#insta_car-navarrows-color-choose').on('change', function () {
      $('input[name="insta_car-navarrows-color"]').val($(this).val());
    });
    $('input[name="insta_car-navarrows-color"]').on('change', function () {
      var hvcolor = $(this).val();
      if (hvcolor != '') {
        var isOk = /^#[0-9A-F]{6}$/i.test(hvcolor);
        if (!isOk) {
          alert('please enter valid color code');
          $(this).val('');
          return;
        }
        $('#insta_car-navarrows-color-choose').val($(this).val());
      } else {
        $('#insta_car-navarrows-color-choose').val('#c32a67');
      }
    });


    // button bgcolor sync
    $('#insta_instalink-bgcolor-choose').on('change', function () {
      $('input[name="insta_instalink-bgcolor"]').val($(this).val());
    });
    $('input[name="insta_instalink-bgcolor"]').on('change', function () {
      var hvcolor = $(this).val();
      if (hvcolor != '') {
        var isOk = /^#[0-9A-F]{6}$/i.test(hvcolor);
        if (!isOk) {
          alert('please enter valid color code');
          $(this).val('');
          return;
        }
        $('#insta_instalink-bgcolor-choose').val($(this).val());
      } else {
        $('#insta_instalink-bgcolor-choose').val('#c32a67');
      }
    });

    // button hover color sync
    $('#insta_instalink-hvrcolor-choose').on('change', function () {
      $('input[name="insta_instalink-hvrcolor"]').val($(this).val());
    });
    $('input[name="insta_instalink-hvrcolor"]').on('change', function () {
      var hvcolor = $(this).val();
      if (hvcolor != '') {
        var isOk = /^#[0-9A-F]{6}$/i.test(hvcolor);
        if (!isOk) {
          alert('please enter valid color code');
          $(this).val('');
          return;
        }
        $('#insta_instalink-hvrcolor-choose').val($(this).val());
      } else {
        $('#insta_instalink-hvrcolor-choose').val('#da894a');
      }
    });

    // Spinner
    // -------------------------------------------------------------------------

    function ig_change_spinner(link) {
      if (link) {
        if (!$('.ig_adv-setting .ig-spinner img').length) {
          var img = '<img src="' + link + '" class="ig-spin" />';
          $('.ig_adv-setting .ig-spinner').append(img);
        } else {
          $('.ig_adv-setting .ig-spinner img').attr('src', link);
        }
        $('.ig_adv-setting .ig-spinner .ig-spin').hide();
        $('.ig_adv-setting .ig-spinner img').show();
      } else {
        $('.ig_adv-setting .ig-spinner .ig-spin').show();
        $('.ig_adv-setting .ig-spinner img').remove();
      }

    }

    var $igs_image_id = $('input[name="igs_spinner_image_id"]'),
            $igs_reset = $('#igs-spinner_reset');

    $('.ig_adv-setting input[name="igs-spinner"]').trigger('change');

    $('.ig_adv-setting-toggle').on('click', function () {
      $(this).toggleClass('active');
      $('.ig_adv-setting').slideToggle();
    });

    $('#ig-adv-setting').on('submit', function (e) {
      e.preventDefault();

      var $form = $(this),
              $spinner = $form.find('.spinner');

      $.ajax({
        url: ajaxurl,
        type: 'post',
        dataType: 'JSON',
        data: {
          action: 'igara_save_igadvs',
          igs_flush: $form.find('input[name=igs_flush]').is(':checked') || 0,
          igs_spinner_image_id: $form.find('input[name=igs_spinner_image_id]').val(),
          ig_nonce: $form.find('input[name=ig_nonce]').val()
        },
        beforeSend: function () {
          $spinner.addClass('is-active');
        },
        success: function (response) {
          if (response.success) {
            console.log(response.data);
          }
        },
        complete: function () {
          $spinner.removeClass('is-active');
        },
        error: function (jqXHR, textStatus) {
          console.log(textStatus);
        }
      });
    });

    // reset spinner to default
    $igs_reset.click(function () {
      $igs_image_id.val('');
      ig_change_spinner();
      $(this).hide();
    });

    if ($igs_image_id.val() == '')
      $igs_reset.hide();
    if ($igs_image_id.data('misrc') != '')
      ig_change_spinner($igs_image_id.data('misrc'));

    // select media image
    $('#igs-spinner_media_manager').click(function (e) {
      e.preventDefault();
      var image_frame;

      if (image_frame) {
        image_frame.open();
      }
      // Define image_frame as wp.media object
      image_frame = wp.media({
        title: 'Select Media',
        multiple: false,
        library: {
          type: 'image',
        }
      });

      image_frame.on('close', function () {
        // On close, get selections and save to the hidden input
        // plus other AJAX stuff to refresh the image preview
        var selection = image_frame.state().get('selection');

        if (selection.length) {

          var gallery_ids = new Array();
          var i = 0, attachment_url;

          selection.each(function (attachment) {
            gallery_ids[i] = attachment['id'];
            attachment_url = attachment.attributes.url;
            i++;
          });
          var ids = gallery_ids.join(",");
          $igs_image_id.val(ids);
          ig_change_spinner(attachment_url)
        }

        // toggle reset button
        if ($igs_image_id.val() == '') {
          $igs_reset.hide();
        } else {
          $igs_reset.show();
        }

      });

      image_frame.on('open', function () {
        // On open, get the id from the hidden input
        // and select the appropiate images in the media manager
        var selection = image_frame.state().get('selection');
        var ids = $igs_image_id.val().split(',');

        ids.forEach(function (id) {
          attachment = wp.media.attachment(id);
          attachment.fetch();
          selection.add(attachment ? [attachment] : []);
        });

      });

      image_frame.open();
    });

    // Generate token
    // -------------------------------------------------------------------------
    $('#ig-generate-token').on('submit', function (e) {
      e.preventDefault();

      var $form = $(this),
              $spinner = $form.find('.spinner');

      $.ajax({
        url: ajaxurl,
        type: 'post',
        data: {
          action: 'igara_generate_token',
          ig_client_id: $form.find('input[name=ig_client_id]').val(),
          ig_client_secret: $form.find('input[name=ig_client_secret]').val(),
          ig_nonce: $form.find('input[name=ig_nonce]').val()
        },
        beforeSend: function () {
          $spinner.addClass('is-active');
        },
        success: function (response) {
          if (response.success) {
            setTimeout(function () {
              window.location.href = response.data;
            }, 300);
          } else {
            alert(response.data);
          }
        },
        complete: function () {
          $spinner.removeClass('is-active');
        },
        error: function (jqXHR, textStatus) {
          console.log(textStatus);
        }
      });
    });

    // Remove token
    // -------------------------------------------------------------------------

    $('#ig-remove-token').on('submit', function (e) {
      e.preventDefault();

      var c = confirm('Are you sure want to delete this Token?');

      if (!c) {
        return false;
      }

      var $form = $(this),
              $spinner = $form.find('.spinner');

      $.ajax({
        url: ajaxurl,
        type: 'post',
        data: {
          action: 'igara_remove_token',
          ig_access_token: $form.find('input[name=ig_access_token]').val(),
          ig_nonce: $form.find('input[name=ig_nonce]').val()
        },
        beforeSend: function () {
          $spinner.addClass('is-active');
        },
        success: function (response) {
          if (response.success) {
            setTimeout(function () {
              window.location.href = window.location.href;
            }, 300);
          } else {
            alert(response.data);
          }
        },
        complete: function () {
          $spinner.removeClass('is-active');
        },
        error: function (jqXHR, textStatus) {
          console.log(textStatus);
        }
      });

    });

    // Update token
    // -------------------------------------------------------------------------

    $('#ig-update-token').on('submit', function (e) {
      e.preventDefault();

      var $form = $(this),
              $spinner = $form.find('.spinner');

      $.ajax({
        url: ajaxurl,
        type: 'post',
        data: {
          action: 'igara_update_token',
          ig_access_token: $form.find('input[name=ig_access_token]').val(),
          ig_nonce: $form.find('input[name=ig_nonce]').val()
        },
        beforeSend: function () {
          $spinner.addClass('is-active');
        },
        success: function (response) {
          if (response.success) {
            setTimeout(function () {
              window.location.href = window.location.href;
            }, 300);
          } else {
            alert(response.data);
          }
        },
        complete: function () {
          $spinner.removeClass('is-active');
        },
        error: function (jqXHR, textStatus) {
          console.log(textStatus);
        },
      });
    });

    $('#ig-update-form').on('submit', function (e) {
      e.preventDefault();

      var $form = $(this),
              $spinner = $form.find('.spinner');

      $.ajax({
        url: ajaxurl,
        type: 'post',
        data: $.param($form.serializeArrayAll()) + '&' + $.param({action: 'igara_update_form'}),
        beforeSend: function () {
          $spinner.addClass('is-active');
        },
        success: function (response) {
          if (response.success) {
            setTimeout(function () {
              window.location.href = window.location.href;
            }, 300);
          } else {
            alert(response.data);
          }
        },
        complete: function () {
          $spinner.removeClass('is-active');
        },
        error: function (jqXHR, textStatus) {
          console.log(textStatus);
        },
      });
    });

    $('.ig-form-item-delete').on('click', function (e) {
      e.preventDefault();

      var c = confirm('Are you sure want to delete this item?');

      if (!c) {
        return false;
      }

      var $item = $(this),
              $tr = $item.closest('tr'),
              $spinner = $tr.find('.spinner');

      $.ajax({
        url: ajaxurl,
        type: 'post',
        data: {
          action: 'igara_form_item_delete',
          item_id: $item.data('item_id')
        },
        beforeSend: function () {
          $spinner.addClass('is-active');
        },
        success: function (response) {
          if (response.success) {
            $tr.fadeOut();
          } else {
            alert(response.data);
          }
        },
        complete: function () {
          setTimeout(function () {
            $tr.remove();
          }, 600);
        },
        error: function (jqXHR, textStatus) {
          console.log(textStatus);
        },
      });
    });

  });
})(jQuery);