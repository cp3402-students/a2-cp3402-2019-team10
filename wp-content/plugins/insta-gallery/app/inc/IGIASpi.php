<?php

/**
 * IGIASpi
 * @author Karan Singh
 * @version 1.2.1
 * @depends Wordpress
 * @description script to get instagram public media by using Username and Tag-name.
 */
if (! defined('INSGALLERY_PATH')) {
    return;
}

class IGIASpi
{

    protected $instagram;

    // handle raw result from server, for further processing in your app
    public $remoteResult;

    public $message;

    private $resultsLimit;

    public function __construct()
    {
        $this->instagram = 'https://www.instagram.com/';
        $this->message = '';
        $this->resultsLimit = 50; // limit to 50 only
    }

    /*
     * API call to get access token using authorization code
     * @return boolean or string[access token]
     */
    public function getAccessToken($client_id, $client_secret, $redirect_uri, $code)
    {
        $url = 'https://api.instagram.com/oauth/access_token';
        
        $response = wp_remote_post($url, array(
            'body' => array(
                'client_id' => $client_id,
                'client_secret' => $client_secret,
                'redirect_uri' => $redirect_uri,
                'code' => $code,
                'grant_type' => 'authorization_code',
                'scope' => 'public_content'
            )
        ));
        if (! is_wp_error($response) && isset($response['body']) && ! empty($response['body'])) {
            $data = json_decode($response['body'], true);
            if (isset($data['error_message'])) {
                $this->message = $data['error_message'];
            }
            if (isset($data['access_token'])) {
                return $data['access_token'];
            }
        }
        return false;
    }

    /*
     * API call to get user profile information using access token
     * @return false or array[result]
     */
    public function getUserProfileInfo($access_token)
    {
        $url = 'https://api.instagram.com/v1/users/self/?access_token=' . $access_token;
        
        $response = $this->spider($url);
        if (empty($response)) {
            return false;
        }
        $response = json_decode($response, true);
        
        if (isset($response['meta']['code']) && ($response['meta']['code'] != 200) && isset($response['meta']['error_message'])) {
            $this->message = $response['meta']['error_message'];
            return false;
        }
        
        return isset($response['data']) ? $response['data'] : false;
    }

    /*
     * API call to check if access token is valid
     * @return true or error message
     */
    public function isTokenValid($access_token)
    {
        $url = 'https://api.instagram.com/v1/users/self/?access_token=' . $access_token;
        
        $response = $this->spider($url);
        if (empty($response)) {
            return $this->message;
        }
        $response = json_decode($response);
        
        if (isset($response->meta->code) && ($response->meta->code != 200) && isset($response->meta->error_message)) {
            return $response->meta->error_message;
        }
        
        return true;
    }

    // API call to get user feed using access token :
    public function getUserMedia($access_token, $count = 30)
    {
        $url = 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' . $access_token . '&count=' . $count;
        
        $response = $this->spider($url);
        if (empty($response)) {
            return false;
        }
        $response = json_decode($response, true);
        
        if (isset($response['meta']['code']) && ($response['meta']['code'] != 200) && isset($response['meta']['error_message'])) {
            $this->message = $response['meta']['error_message'];
            return false;
        }
        
        if (! isset($response['data'])) {
            return false;
        }
        
        return $this->setupUserMedia($response['data']);
    }

    protected function setupUserMedia($data)
    {
        $instaItems = array();
        if (is_array($data) && ! empty($data)) {
            foreach ($data as $item)
                $instaItems[] = array(
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
        return $instaItems;
    }

    /**
     * takes Tag name and return items list array
     *
     * @param string $tag            
     * @return array|false
     */
    public function getTagItems($tag = '')
    {
        $instalink = 'https://www.' . 'instagram.com/';
        $tag = urlencode((string) $tag);
        if (empty($tag)) {
            $this->message = 'Please provide a valid # tag';
            return false;
        }
        $url = $instalink . 'explore/tags/' . $tag . '/?__a=1';
        
        $response = $this->spider($url);
        if (empty($response)) {
            return false;
        }
        $response = json_decode($response);
        
        $items = array();
        // API updated on Jan 03 17
        if (isset($response->graphql->hashtag->edge_hashtag_to_media->edges)) {
            $instaItems = $response->graphql->hashtag->edge_hashtag_to_media->edges;
            
            if (! empty($instaItems) && is_array($instaItems)) {
                $instaItems = array_slice($instaItems, 0, $this->resultsLimit);
                foreach ($instaItems as $res) {
                    // its to check if this API have required variables
                    if (! isset($res->node->display_url)) {
                        continue;
                    }
                    $type = 'image';
                    if (isset($res->node->is_video) && (true === $res->node->is_video)) {
                        $type = 'video';
                    }
                    $caption = isset($res->node->edge_media_to_caption->edges[0]->node->text) ? htmlspecialchars($res->node->edge_media_to_caption->edges[0]->node->text) : '';
                    $items[] = array(
                        'img_standard' => $res->node->display_url,
                        'img_low' => $res->node->thumbnail_src,
                        'img_thumb' => $res->node->thumbnail_resources[0]->src,
                        'likes' => $res->node->edge_liked_by->count,
                        'comments' => $res->node->edge_media_to_comment->count,
                        'caption' => '', // $caption
                        'code' => $res->node->shortcode,
                        'type' => $type,
                        'owner_id' => $res->node->owner->id
                    );
                }
            }
        }
        
        return empty($items) ? false : $items;
    }

    /**
     * takes URL string and return URL content
     *
     * @param string $url            
     * @return string|boolean
     */
    public function spider($url = '')
    {
        if (empty($url) || (! filter_var($url, FILTER_VALIDATE_URL))) {
            $this->message = 'Please provide a Valid URL';
            return false;
        }
        $responseBody = '';
        
        // get results if script executed in WP
        if (function_exists('wp_remote_request')) {
            $response = wp_remote_request($url);
            if (is_wp_error($response)) {
                $this->message = 'WP Error: ' . implode(', ', $response->get_error_messages());
            } else {
                if (200 !== wp_remote_retrieve_response_code($response)) {
                    $this->message = 'ERROR: Response Code: ' . wp_remote_retrieve_response_code($response);
                }
                
                if (isset($response['body']) && ! empty($response['body'])) {
                    $responseBody = $response['body'];
                }
            }
        } else {
            $this->message = 'Error: running outside WP.';
        }
        if (! defined('INSGALLERY' . '_PATH'))
            $responseBody = '';
        
        $this->remoteResult = $responseBody;
        return $responseBody;
    }

    // return message
    public function getMessage()
    {
        return $this->message;
    }
}

