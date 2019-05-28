<?php
$current = time();
if (mktime(0, 0, 0, 6, 4, 2019) <= $current && $current <= mktime(0, 0, 0, 6, 7, 2019)) {
    if (get_option('ss3_2019_summer') != '1') {

        add_action('admin_enqueue_scripts', function () {
            wp_enqueue_script('jquery');
        });

        add_action('admin_notices', function () {
            ?>
            <div style="margin-top:40px;margin-bottom:40px;" class="notice notice-info is-dismissible" data-ss3dismissable="ss3_2019_summer">
                <h3>Smart Slider 3 Pro - Summer Sale 40% Off</h3>
                <p>For only three days, you can get <b>Smart Slider 3 Pro - Unlimited plan for $150 which is 40%
                        off</b>! Head over to our site and enter code <b>SUMMER19</b> at checkout! This hot deal
                    is active for 3 days only, <b>from 4 to 6 June</b>. Hurry up!</p>
                <p>
                    <a class="button button-primary" href="https://smartslider3.com/?coupon=SUMMER19&utm_source=wordpress-free&utm_medium=wordpress-free&utm_campaign=summer" target="_blank">Grab
                        The Deal</a>
                    <a class="button button-dismiss" href="#">Dismiss</a>
                </p>
            </div>
            <?php
        });

        add_action('admin_footer', function () {
            ?>
            <script type="text/javascript">
                (function ($) {
                    $(function () {
                        setTimeout(function () {
                            $('div[data-ss3dismissable] .notice-dismiss, div[data-ss3dismissable] .button-dismiss')
                                .on('click', function (e) {
                                    e.preventDefault();
                                    $.post(ajaxurl, {
                                        'action': 'ss3_dismiss_admin_notice',
                                        'nonce': <?php echo json_encode(wp_create_nonce('ss3-dismissible-notice')); ?>
                                    });
                                    $(e.target).closest('.is-dismissible').remove();
                                });
                        }, 1000);
                    });
                })(jQuery);
            </script>
            <?php
        });

        add_action('wp_ajax_ss3_dismiss_admin_notice', function () {
            check_ajax_referer('ss3-dismissible-notice', 'nonce');

            update_option('ss3_2019_summer', '1');
            wp_die();
        });
    }
}

