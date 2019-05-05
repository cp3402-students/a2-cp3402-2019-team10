<?php

class N2DBConnector extends N2DBConnectorAbstract {

    /** @var $wpdb wpdb */
    private $db;

    private static $nameQuote = '`';

    public $primaryKeyColumn = "id";

    public function __construct($class) {
        /** @var $wpdb wpdb */
        global $wpdb;
        $this->db      = $wpdb;
        $this->_prefix = $wpdb->prefix;
        $this->setTableName($class);
    }

    public function query($query, $attributes = false) {
        if ($attributes) {
            foreach ($attributes as $key => $value) {
                $replaceTo = is_numeric($value) ? $value : $this->db->prepare('%s', $value);
                $query     = str_replace($key, $replaceTo, $query);
            }
        }

        if ($this->db->query($query) === false) {
            if (is_admin()) {
                echo $this->db->last_error;
                exit();
            }
        }
    }

    public function findByPk($primaryKey) {
        $query = $this->db->prepare("
        SELECT *
        FROM {$this->tableName}
        WHERE {$this->quoteName($this->primaryKeyColumn)} = %s
        ", $primaryKey);

        return $this->db->get_row($query, ARRAY_A);
    }

    private function _findByAttributesSQL(array $attributes, $fields = false, $order = false) {

        $args = array('');

        $query = 'SELECT ';
        if ($fields) {

            $fields = array_map(array(
                $this,
                'quoteName'
            ), $fields);

            $query .= implode(', ', $fields);
        } else {
            $query .= '*';
        }
        $query .= ' FROM ' . $this->tableName;

        $where = array();
        foreach ($attributes as $key => $val) {
            $where[] = $this->quoteName($key) . ' = ' . (is_numeric($val) ? '%d' : '%s');
            $args[]  = $val;
        }
        if (count($where)) {
            $query .= ' WHERE ' . implode(' AND ', $where);
        }

        if ($order) {
            $query .= ' ORDER BY ' . $order;
        }

        if (count($args) > 1) {
            $args[0] = $query;

            return call_user_func_array(array(
                $this->db,
                'prepare'
            ), $args);
        } else {
            return $query;
        }
    }

    public function findByAttributes(array $attributes, $fields = false, $order = false) {

        return $this->db->get_row($this->_findByAttributesSQL($attributes, $fields, $order), ARRAY_A);
    }


    public function findAll($order = false) {

        return $this->db->get_results($this->_findByAttributesSQL(array(), false, $order), ARRAY_A);
    }

    /**
     * Return with all row by attributes
     *
     * @param array       $attributes
     * @param bool|array  $fields
     * @param bool|string $order
     *
     * @return mixed
     */
    public function findAllByAttributes(array $attributes, $fields = false, $order = false) {

        return $this->db->get_results($this->_findByAttributesSQL($attributes, $fields, $order), ARRAY_A);
    }

    private function _querySQL($query, $attributes = false) {

        $args = array('');

        if ($attributes) {
            foreach ($attributes as $key => $value) {
                $replaceTo = is_numeric($value) ? '%d' : '%s';
                $query     = str_replace($key, $replaceTo, $query);
                $args[]    = $value;
            }
        }


        if (count($args) > 1) {
            $args[0] = $query;

            return call_user_func_array(array(
                $this->db,
                'prepare'
            ), $args);
        } else {
            return $query;
        }
    }

    /**
     * Return with one row by query string
     *
     * @param string     $query
     * @param array|bool $attributes for parameter binding
     *
     * @return mixed
     */
    public function queryRow($query, $attributes = false) {
        return $this->db->get_row($this->_querySQL($query, $attributes), ARRAY_A);
    }

    public function queryAll($query, $attributes = false, $type = "assoc", $key = null) {
        $result = $this->db->get_results($this->_querySQL($query, $attributes), $type == 'assoc' ? ARRAY_A : OBJECT_K);
        if (!$key) {
            return $result;
        }
        $realResult = array();

        for ($i = 0; $i < count($result); $i++) {
            $key              = $type == 'assoc' ? $result[i][$key] : $result[i]->{$key};
            $realResult[$key] = $result[i];
        }

        return $realResult;
    }

    /**
     * Insert new row
     *
     * @param array $attributes
     *
     * @return mixed|void
     */
    public function insert(array $attributes) {
        return $this->db->insert($this->tableName, $attributes);
    }

    public function insertId() {
        return $this->db->insert_id;
    }

    /**
     * Update row(s) by param(s)
     *
     * @param array $attributes
     * @param array $conditions
     *
     * @return mixed
     */
    public function update(array $attributes, array $conditions) {

        return $this->db->update($this->tableName, $attributes, $conditions);
    }

    /**
     * Update one row by primary key with $attributes
     *
     * @param mixed $primaryKey
     * @param array $attributes
     *
     * @return mixed
     */
    public function updateByPk($primaryKey, array $attributes) {

        $where                          = array();
        $where[$this->primaryKeyColumn] = $primaryKey;
        $this->db->update($this->tableName, $attributes, $where);
    }

    /**
     * Delete one with by primary key
     *
     * @param mixed $primaryKey
     *
     * @return mixed
     */
    public function deleteByPk($primaryKey) {
        $where                          = array();
        $where[$this->primaryKeyColumn] = $primaryKey;
        $this->db->delete($this->tableName, $where);
    }

    /**
     * Delete all rows by attributes
     *
     * @param array $conditions
     *
     * @return mixed
     */
    public function deleteByAttributes(array $conditions) {
        $this->db->delete($this->tableName, $conditions);
    }

    /**
     * @param string $text
     * @param bool   $escape
     *
     * @return string
     */
    public function quote($text, $escape = true) {
        return '\'' . (esc_sql($text)) . '\'';
    }

    /**
     * @param string $name
     * @param null   $as
     *
     * @return mixed
     */
    public function quoteName($name, $as = null) {
        if (strpos($name, '.') !== false) {
            return $name;
        } else {
            $q = self::$nameQuote;
            if (strlen($q) == 1) {
                return $q . $name . $q;
            } else {
                return $q{0} . $name . $q{1};
            }
        }
    }
}