<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'staging' );

/** MySQL database username */
define( 'DB_USER', 'cp3402' );

/** MySQL database password */
define( 'DB_PASSWORD', 'CoffeeCan.3402' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         '#J++[6s3^A3)Ndrq@wt@Eh/4mhU(5?TP8ug7~w$5J^BWF T_nxFA&?f{#@K<*nR2' );
define( 'SECURE_AUTH_KEY',  'xvP;M0{:2I!mRkE8}C#_Dxed[@.@U}}^{B&[6uGQ;)9Hvw=v_k5=^>S-S3?GnCYG' );
define( 'LOGGED_IN_KEY',    '<kj~7zK{#9%:Bt4JW< !wFA&BBq_}iMjoJh9AO?c}ZtiIL|:!:;doMId@]RX|~#g' );
define( 'NONCE_KEY',        'z`.<AEq5`}oM2TX(v~&Ch0%@.IEEWTz;q2d8L3=soA5M_{u(2oU{)-nED=L&hgdF' );
define( 'AUTH_SALT',        '^(*%>)!OBt+Y44iJJ!BF0$v),,k~P$}3<X%SrJME x*n?Gz4:(ky1Q/qF)VnN8w4' );
define( 'SECURE_AUTH_SALT', 'QRfEa%/poh3,2ZTwzYf+,XeVES-5.p#UokDlaL6QB1L6roiC_ Ak#Ie}Coy #FUi' );
define( 'LOGGED_IN_SALT',   '.@f3|xXRVA#U8moSw#:z}P  |9@5DTq~>fC(0^r0GFKEv7J%;_[y5Mzl:-F_k_AL' );
define( 'NONCE_SALT',       '_90&:LChI 1?KjzB%rYW^5 gT.Vi&j;[<Em$;E{]?Q%uOEa+2hMwp.w*#`vI%T}e' );

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the Codex.
 *
 * @link https://codex.wordpress.org/Debugging_in_WordPress
 */
define( 'WP_DEBUG', false );

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', dirname( __FILE__ ) . '/' );
}

/** Sets up WordPress vars and included files. */
require_once( ABSPATH . 'wp-settings.php' );
