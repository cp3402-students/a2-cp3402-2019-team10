<div class="wpstg-error">
    <p>
        <strong>WP Staging Folder Permission error: </strong>
        <?php echo \WPStaging\WPStaging::getContentDir()?>
        is not write and/or readable.
        <br>
        Check if the folder <strong><?php echo \WPStaging\WPStaging::getContentDir()?></strong> exists!
        Folder permissions should be chmod 755 or higher.
    </p>
</div>