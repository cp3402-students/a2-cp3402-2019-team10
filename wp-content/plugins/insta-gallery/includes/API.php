<?php

if (!defined('ABSPATH'))
  exit;

if (!class_exists('QLIGG_API')) {

  class QLIGG_API {

    protected $instagram;
    public $message;
    private $limit = 50;
    private $api_url = 'https://api.instagram.com/v1/users/self';
    private $token_url = 'https://api.instagram.com/oauth';

    // API generate code generation url
    // ---------------------------------------------------------------------------
    public function get_access_code($client_id = null) {

      $args = array(
          'client_id' => $client_id,
          'response_type' => 'code',
          'scope' => 'public_content',
          'redirect_uri' => urlencode(admin_url('admin.php?page=qligg_token&igigresponse=1'))
      );

      return add_query_arg($args, "{$this->token_url}/authorize/");
    }

    // API call to get access token using authorization code
    // ---------------------------------------------------------------------------
    public function get_access_token($client_id, $client_secret, $redirect_uri, $code) {

      $args = array(
          'body' => array(
              'client_id' => $client_id,
              'client_secret' => $client_secret,
              'redirect_uri' => $redirect_uri,
              'code' => $code,
              'grant_type' => 'authorization_code',
              'scope' => 'public_content'
      ));

      $response = $this->validate_response(wp_remote_post("{$this->token_url}/access_token", $args));

      if (isset($response['access_token'])) {
        return $response['access_token'];
      }

      return false;
    }

    // API call to get user profile information using access token
    // ---------------------------------------------------------------------------
    public function get_user_profile($access_token) {

      $args = array(
          'access_token' => $access_token
      );

      $response = $this->remote_get($this->api_url, $args);

      if (empty($response)) {
        return false;
      }

      if (isset($response['meta']['code']) && ($response['meta']['code'] != 200) && isset($response['meta']['error_message'])) {
        $this->message = $response['meta']['error_message'];

        //error_log($this->message);
        return false;
      }

      return isset($response['data']) ? $response['data'] : false;
    }

    // API call to check if access token is valid
    // ---------------------------------------------------------------------------
    public function validate_token($access_token) {

      $args = array(
          'access_token' => $access_token
      );

      $response = $this->remote_get($this->api_url, $args);

      if (isset($response['meta']['code']) && $response['meta']['code'] == 200) {
        return true;
      }

      if (isset($response['meta']['error_message'])) {
        $this->message = $response['meta']['error_message'];
      }

      return false;
    }

    // API call to get user feed using access token
    // ---------------------------------------------------------------------------
    public function get_user_items($access_token, $count = 30) {

      $args = array(
          'access_token' => $access_token,
          'count' => $count
      );

      $url = add_query_arg($args, trailingslashit("{$this->api_url}/media/recent/"));

      $response = $this->remote_get($url);

      if (empty($response)) {
        return false;
      }

      if (isset($response['meta']['code']) && ($response['meta']['code'] != 200) && isset($response['meta']['error_message'])) {
        $this->message = $response['meta']['error_message'];
        return false;
      }

      if (!isset($response['data'])) {
        return false;
      }

      return $this->setup_user_item($response['data']);
    }

    protected function setup_user_item($data) {

      $instagram_items = array();

      if (is_array($data) && !empty($data)) {
        foreach ($data as $id => $item) {
          $instagram_items[] = array(
              'img_standard' => $item['images']['standard_resolution']['url'],
              'img_low' => $item['images']['low_resolution']['url'],
              'img_thumb' => $item['images']['thumbnail']['url'],
              'likes' => $item['likes']['count'],
              'comments' => $item['comments']['count'],
              'caption' => '',
              'code' => '',
              'link' => $item['link'],
              'type' => $item['type'],
              'owner_id' => ''
          );
        }
      }

      return $instagram_items;
    }

    // Tag name and return items list array
    // ---------------------------------------------------------------------------
    public function get_tag_items($tag = null) {

      if ($tag) {

        $tag = urlencode((string) $tag);

        $url = "https://www.instagram.com/explore/tags/{$tag}/?__a=1";

        $args = array(
            '__a' => 1
        );

        $response = $this->remote_get($url, $args);

        $tag_items = array();

        // API updated on Jan 03 17
        // -----------------------------------------------------------------------
        if (isset($response['graphql']['hashtag']['edge_hashtag_to_media']['edges'])) {

          $instagram_items = $response['graphql']['hashtag']['edge_hashtag_to_media']['edges'];

          if (count($instagram_items)) {

            $instagram_items = array_slice($instagram_items, 0, $this->limit);


            foreach ($instagram_items as $res) {

              // Its to check if this API have required variables
              // -----------------------------------------------------------------

              if (!isset($res['node']['display_url'])) {
                continue;
              }

              $type = 'image';

              if (isset($res['node']['is_video']) && (true === $res['node']['is_video'])) {
                $type = 'video';
              }

              $caption = isset($res['node']['edge_media_to_caption']['edges'][0]['node']['text']) ? htmlspecialchars($res['node']['edge_media_to_caption']['edges'][0]['node']['text']) : '';

              $tag_items[] = array(
                  'img_standard' => $res['node']['display_url'],
                  'img_low' => $res['node']['thumbnail_src'],
                  'img_thumb' => $res['node']['thumbnail_resources'][0]['src'],
                  'likes' => $res['node']['edge_liked_by']['count'],
                  'comments' => $res['node']['edge_media_to_comment']['count'],
                  'caption' => $caption,
                  'code' => $res['node']['shortcode'],
                  'type' => $type,
                  'owner_id' => $res['node']['owner']['id']
              );
            }
          }
        }

        return $tag_items;
      }

      $this->message = __('Please provide a valid #tag', 'insta-gallery');
    }

    function validate_response($json = null) {

      if (!($response = json_decode(wp_remote_retrieve_body($json), true)) || 200 !== wp_remote_retrieve_response_code($json)) {

        if (isset($response['meta']['error_message'])) {
          $this->message = $response['meta']['error_message'];
          return array(
              'error' => 1,
              'message' => $this->message
          );
        }

        if (isset($response['error_message'])) {
          $this->message = $response['error_message'];
          return array(
              'error' => 1,
              'message' => $this->message
          );
        }

        if (is_wp_error($json)) {
          $response = array(
              'error' => 1,
              'message' => $json->get_error_message()
          );
        } else {
          $response = array(
              'error' => 1,
              'message' => __('Unknow error occurred, please try again', 'insta-gallery')
          );
        }
      }

      return $response;
    }

    public function remote_get($url = null, $args = array()) {

      $url = add_query_arg($args, trailingslashit($url));

      $response = $this->validate_response(wp_remote_get($url, array('timeout' => 29)));

      return $response;
    }

    // Return message
    // ---------------------------------------------------------------------------
    public function get_message() {
      return $this->message;
    }

  }

}
