<label id="wpstg-clone-label" for="wpstg-new-clone">
    <?php echo __( 'Staging Site Name:', 'wp-staging' ) ?>
    <input type="text" id="wpstg-new-clone-id" value="<?php echo $options->current; ?>"<?php if( null !== $options->current ) echo " disabled='disabled'" ?>>
</label>

<span class="wpstg-error-msg" id="wpstg-clone-id-error" style="display:none;">
    <?php
    echo __(
            "<br>Probably not enough free disk space to create a staging site. " .
            "<br> You can continue but its likely that the copying process will fail.", "wp-staging"
    )
    ?>
</span>

<div class="wpstg-tabs-wrapper">
    <a href="#" class="wpstg-tab-header active" data-id="#wpstg-scanning-db">
        <span class="wpstg-tab-triangle">&#9658;</span>
        <?php echo __( "Database Tables", "wp-staging" ) ?>
    </a>

    <div class="wpstg-tab-section" id="wpstg-scanning-db">
            <?php do_action( "wpstg_scanning_db" ) ?>
        <h4 style="margin:0">
            <?php
            echo __(
                    "Select the tables you like to clone. All tables beginning with prefix '{$scan->prefix}' have been selected already.", "wp-staging"
            );
            ?>
            <p></p>
            <?php
            echo __(
                    "Select multiple tables by pressing left mouse button and moving or by pressing STRG+Left Mouse button. (Mac ⌘+Left Mouse Button)", "wp-staging"
            );
            ?>
        </h4>
        <div style="margin-top:10px;margin-bottom:10px;">
            <a href="#" class="wpstg-button-unselect button"><?php _e('Unselect All','wp-staging'); ?></a>
            <a href="#" class="wpstg-button-select button"> <?php _e( WPStaging\WPStaging::getTablePrefix(), 'wp-staging' ); ?> </a>
        </div>
        <select multiple="multiple" id="wpstg_select_tables_cloning">
        <?php
        foreach ( $options->tables as $table ):
                $attributes =  !in_array( $table->name, $options->excludedTables ) && (strpos( $table->name, $db->prefix ) === 0) ? "selected='selected'" : "";
                $attributes .= in_array( $table->name, $options->clonedTables ) ? "disabled" : '';
            ?>
                <option class="wpstg-db-table" value="<?php echo $table->name ?>" name="<?php echo $table->name ?>" <?php echo $attributes ?>>
                    <?php echo $table->name ?>           - <?php echo $scan->formatSize( $table->size ) ?>
                </option>
            <?php endforeach ?>
        </select>



        <?php
//        foreach ( $options->tables as $table ):
//            $attributes = in_array( $table->name, $options->excludedTables ) ? '' : "checked";
//            $attributes .= in_array( $table->name, $options->clonedTables ) ? " disabled" : '';
            ?>
<!--            <div class="wpstg-db-table">
                <label>
                    <input class="wpstg-db-table-checkboxes" type="checkbox" name="<?php // echo $table->name ?>" <?php // echo $attributes ?>>
                    <?php // echo $table->name ?>
                </label>
                <span class="wpstg-size-info">
                    <?php // echo $scan->formatSize( $table->size ) ?>
                </span>
            </div>-->
        <?php // endforeach ?>
        
        <div style="margin-top:10px;">
            <a href="#" class="wpstg-button-unselect button"> <?php _e('Unselect All','wp-staging'); ?> </a>
            <a href="#" class="wpstg-button-select button"> <?php _e( WPStaging\WPStaging::getTablePrefix(), 'wp-staging' ); ?> </a>
        </div>
    </div>

    <a href="#" class="wpstg-tab-header" data-id="#wpstg-scanning-files">
        <span class="wpstg-tab-triangle">&#9658;</span>
        <?php echo __( "Files", "wp-staging" ) ?>
    </a>

    <div class="wpstg-tab-section" id="wpstg-scanning-files">
        <h4 style="margin:0">
            <?php echo __( "Select folders to copy. Click on folder name to list subfolders!", "wp-staging" ) ?>
        </h4>

        <?php echo $scan->directoryListing() ?>

        <h4 style="margin:10px 0 10px 0">
            <?php echo __( "Extra directories to copy", "wp-staging" ) ?>
        </h4>

        <textarea id="wpstg_extraDirectories" name="wpstg_extraDirectories" style="width:100%;height:100px;"></textarea>
        <p>
            <span>
                <?php
                echo __(
                        "Enter one folder path per line.<br>" .
                        "Folders must start with absolute path: " . $options->root, "wp-staging"
                )
                ?>
            </span>
        </p>

        <p>
            <span>
                <?php
                if( isset( $options->clone ) ) {
                    echo __( "All files will be copied to: ", "wp-staging" ) . $options->root . $options->clone;
                }
                ?>
            </span>
        </p>
    </div>

    <a href="#" class="wpstg-tab-header" data-id="#wpstg-advanced-settings" style="display:block;">
        <span class="wpstg-tab-triangle">&#9658;</span>
        <?php echo __( "Advanced Settings / Pro", "wp-staging" ); ?>
    </a>

    <div class="wpstg-tab-section" id="wpstg-advanced-settings" style="display:none;">

        <?php
        require_once (__DIR__ . DIRECTORY_SEPARATOR . 'external-database.php');
        require_once (__DIR__ . DIRECTORY_SEPARATOR . 'custom-directory.php');
        ?>

    </div>

</div>

<button type="button" class="wpstg-prev-step-link wpstg-link-btn button-primary wpstg-button">
    <?php _e( "Back", "wp-staging" ) ?>
</button>

<?php
if( null !== $options->current ) {
    $label  = __( "Update Clone", "wp-staging" );
    $action = 'wpstg_update';

    echo '<button type="button" id="wpstg-start-updating" class="wpstg-next-step-link  wpstg-link-btn button-primary wpstg-button" data-action="' . $action . '">' . $label . '</button>';
} else {
    $label  = __( "Start Cloning", "wp-staging" );
    $action = 'wpstg_cloning';

    echo '<button type="button" id="wpstg-start-cloning" class="wpstg-next-step-link wpstg-link-btn button-primary wpstg-button" data-action="' . $action . '">' . $label . '</button>';
}
?>

<a href="#" id="wpstg-check-space"><?php _e( 'Check Free Disk Space', 'wp-staging' ); ?></a>
