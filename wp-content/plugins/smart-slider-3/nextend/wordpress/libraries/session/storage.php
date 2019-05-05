<?php

class N2SessionStorage extends N2SessionStorageAbstract {

    public function __construct() {
        parent::__construct(get_current_user_id());
    }

    /**
     * Load the whole session
     */
    protected function load() {
        $stored = get_transient($this->hash);

        if (!is_array($stored)) {
            $stored = array();
        }
        $this->storage = $stored;
    }

    /**
     * Store the whole session
     */
    protected function store() {
        if (count($this->storage) > 0) {
            set_transient($this->hash, $this->storage, self::$expire);
        } else {
            delete_transient($this->hash);
        }
    }

}