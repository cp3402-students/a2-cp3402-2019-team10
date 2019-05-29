<?php

/**
 * JCU CNS 2019 SP1 CP3402 A2 Team 10.
 * @author Yvan Burrie
 */

namespace cp3402;

use DirectoryIterator, SplFileInfo, Exception;

require_once 'utilities.php';

/** @var array|null $ERROR */
$ERROR = NULL;

try{
    /** @var Configurations $CONFIGURATIONS */
    $CONFIGURATIONS = Configurations::openIni('configurations.ini');
}catch( Exception $exception ){
    $ERROR = [
        'Configurations Error',
        $exception->getMessage(),
    ];
}

$MENU = [
    'work' => '<a href="?">Work</a>',
];

/** @var string|null $ACTION */
$ACTION = $_GET['action'] ?? NULL;
switch( $ACTION ){
    case 'hook':
        file_put_contents('hook.txt', $_POST);
        if( FALSE === $CONFIGURATIONS->handleHook($_POST) ){
            $ERROR = [
                'Hook Error',
                'Invalid hook triggered.',
            ];
        }
        file_put_contents('log.txt', implode("\n", $CONFIGURATIONS->output));
        break;
    case 'deploy':
        $MENU[] = '<a href="?' . http_build_query(['action' => 'deploy']) .'">Deploy</a>';
        $developer = $CONFIGURATIONS->developers[$developerId = $_GET['dev'] ?? NULL] ?? NULL;
        if( NULL !== $developerId &&
            NULL !== $developer ){

            $MENU[] = '<a href="?' . http_build_query(['action' => 'deploy', 'dev' => $developerId]) .'">' . htmlspecialchars($developer->identifier) . '</a>';

            if( NULL === $buffer1 = $_POST['mysql_path_used'] ?? NULL ){
                $developerMysqlPathUsed = NULL !== $developer->mysqlPath;
            }else{
                $developerMysqlPathUsed = 'on' == $buffer1;
            }
            if( NULL === $buffer1 = $_POST['mysql_path'] ?? NULL ){
                $developerMysqlPath = $developer->mysqlPath !== NULL ? implode(DIRECTORY_SEPARATOR, $developer->mysqlPath) : '';
            }else{
                $developerMysqlPath = (string)$buffer1;
            }
            if( NULL === $buffer1 = $_POST['git_path_used'] ?? NULL ){
                $developerGitPathUsed = NULL !== $developer->gitPath;
            }else{
                $developerGitPathUsed = 'on' == $buffer1;
            }
            if( NULL === $buffer1 = $_POST['git_path'] ?? NULL ){
                $developerGitPath = $developer->gitPath !== NULL ? implode(DIRECTORY_SEPARATOR, $developer->gitPath) : '';
            }else{
                $developerGitPath = (string)$buffer1;
            }
            if( NULL === $buffer1 = $_POST['root_path_used'] ?? NULL ){
                $developerRootPathUsed = NULL !== $developer->rootPath;
            }else{
                $developerRootPathUsed = 'on' == $buffer1;
            }
            if( NULL === $buffer1 = $_POST['root_path'] ?? NULL ){
                $developerRootPath = $developer->rootPath !== NULL ? implode(DIRECTORY_SEPARATOR, $developer->rootPath) : '';
            }else{
                $developerRootPath = (string)$buffer1;
            }
            if( NULL === $buffer1 = $_POST['do_exp'] ?? NULL ){
                $mustExport = FALSE;
            }else{
                $mustExport = 'on' == $buffer1;
            }
            if( NULL === $buffer1 = $_POST['do_imp'] ?? NULL ){
                $mustImport = FALSE;
            }else{
                $mustImport = 'on' == $buffer1;
            }
            if( NULL === $buffer1 = $_POST['do_pull'] ?? NULL ){
                $mustPull = FALSE;
            }else{
                $mustPull = 'on' == $buffer1;
            }
            if( NULL === $buffer1 = $_POST['do_push'] ?? NULL ){
                $mustPush = FALSE;
            }else{
                $mustPush = 'on' == $buffer1;
            }
            if( NULL === $buffer1 = $_POST['db_file'] ?? NULL ){
                $baseImportName = NULL;
            }else{
                $baseImportName = (string)$buffer1;
            }
            if( NULL === $wpUrl = $_POST['wp_url'] ?? NULL ){
                $wpUrl = $developer->wpUrl;
            }else{
                $wpUrl = (string)$wpUrl;
            }
            if( NULL === $buffer1 = $_POST['do_wp_url'] ?? NULL ){
                $wpUrlModify = FALSE;
            }else{
                $wpUrlModify = 'on' == $buffer1;
            }
            if( NULL === $buffer1 = $_POST['base_name'] ?? NULL ){
                $baseExportName = $CONFIGURATIONS->baseName;
            }else{
                $baseExportName = (string)$buffer1;
            }
            /** @var string[] $backupFiles */
            $backupFiles = [];
            /** @var SplFileInfo $fileInfo */
            foreach( new DirectoryIterator(implode(DIRECTORY_SEPARATOR, $CONFIGURATIONS->basePath)) as $fileInfo ){
                if( $fileInfo->isDot() ) continue;
                if( 'sql' == $fileInfo->getExtension() ){
                    $backupFiles[] = substr($fileInfo->getFilename(), 0, -4);
                }
            }
            switch( $tool = $_POST['tool'] ?? NULL ){
                case 'upload':
                    if( $mustExport ){
                        $developer->database->export(TRUE, $baseExportName);
                        //$developer->commitLastBases();
                    }
                    if( $mustPush ){
                        $developer->push();
                    }
                    break;
                case 'download':
                    if( $mustPull ){
                        $developer->pull();
                    }
                    if( $mustImport ){
                        $developer->database->import($baseImportName);
                    }
                    if( $wpUrlModify ){
                        $developer->database->modifyWpUrl();
                    }
                    break;
            }
        }
        break;
    case NULL:
        // go to main menu
        break;
    default:
        $ERROR = [
            'Unknown Action',
            'The requested action is not known.',
        ];
        break;
}
?>

<style>
    body, p, button, input, h1, li, fieldset, legend {
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        font-size: 14px;
    }
    h1, legend {
        font-weight: bold;
    }
    h1 {
        font-size: 20px;
    }
    input[type=text] {
        width: 300px;
    }
</style>

<?php if( $ERROR ): ?>

<h1><?php echo htmlspecialchars($ERROR[0]); ?></h1>
<p><?php echo htmlspecialchars($ERROR[1]); ?></p>
<pre><?php $CONFIGURATIONS->flush(); ?></pre>

<?php else: ?>

<h1><?php echo implode(' / ', $MENU); ?></h1>

<?php if( $ACTION == 'deploy'): ?>

    <?php if( $developer ): ?>
        <form method="post" action="?<?php echo http_build_query(['action' => 'deploy', 'dev' => $developerId]); ?>">
            <fieldset><legend>Root Path</legend>
                <input type="checkbox" name="root_path_used"<?php if( $developerRootPathUsed ): ?> checked<?php endif; ?>/>
                <input type="text" name="root_path" value="<?php echo htmlspecialchars($developerRootPath); ?>"/>
            </fieldset>
            <fieldset><legend>Git Path</legend>
                <input type="checkbox" name="git_path_used"<?php if( $developerGitPathUsed ): ?> checked<?php endif; ?>/>
                <input type="text" name="git_path" value="<?php echo htmlspecialchars($developerGitPath); ?>"/>
            </fieldset>
            <fieldset><legend>MySQL Path</legend>
                <input type="checkbox" name="mysql_path_used"<?php if( $developerMysqlPathUsed ): ?> checked<?php endif; ?>/>
                <input type="text" name="mysql_path" value="<?php echo htmlspecialchars($developerMysqlPath); ?>"/>
            </fieldset>
            <fieldset><legend>Download</legend>
                <p><label for="do_pull"><input type="checkbox" name="do_pull" id="do_pull"<?php if( $mustPull ): ?> checked<?php endif; ?>/> Pull changes</label></p>
                <p><label for="do_imp"><input type="checkbox" name="do_imp" id="do_imp"<?php if( $mustImport ): ?> checked<?php endif; ?>/> Import database:</label>
                    <select name="db_file">
                    <?php foreach($backupFiles as $backupFile ): ?>
                    <option value="<?php echo htmlspecialchars($backupFile); ?>"<?php if( $baseImportName == $backupFile ): ?> selected<?php endif; ?>><?php echo htmlspecialchars($backupFile); ?></option>
                    <?php endforeach; ?>
                    </select></p>
                <p><label for="do_wp_url"><input type="checkbox" name="do_wp_url" id="do_wp_url"<?php if( $wpUrlModify ): ?> checked="checked"<?php endif; ?>/> Modify WordPress URL to:
                        <input type="text" name="wp_url" value="<?php echo htmlspecialchars($wpUrl); ?>"/></label></p>
                <p><button type="submit" name="tool" value="download">Execute &raquo;</button></p>
                <?php if( $tool == 'download' ): ?>
                <pre><?php $CONFIGURATIONS->flush(); ?></pre>
                <?php endif; ?>
            </fieldset>
            <fieldset><legend>Upload</legend>
                <p><label for="do_exp"><input type="checkbox" name="do_exp" id="do_exp"<?php if( $mustExport ): ?> checked<?php endif; ?>/> Export database:
                    <input type="text" name="base_name" value="<?php echo htmlspecialchars($baseExportName); ?>" style="width: 100px;"/>.sql</label></p>
                <p><label for="do_push"><input type="checkbox" name="do_push" id="do_push"<?php if( $mustPush ): ?> checked<?php endif; ?>/> Push changes</label></p>
                <p><button type="submit" name="tool" value="upload">Execute &raquo;</button></p>
                <?php if( $tool == 'upload' ): ?>
                <pre><?php $CONFIGURATIONS->flush(); ?></pre>
                <?php endif; ?>
            </fieldset>
            <fieldset><legend>Post Request</legend>
                <pre><?php print_r($_POST); ?></pre>
            </fieldset>
        </form>
    <?php else: ?>
        <form method="get">
            <input type="hidden" name="action" value="deploy"/>
            <p><select name="dev" style="width: 200px;">
                <?php foreach( $CONFIGURATIONS->developers as $configsDeveloperId => $configsDeveloper ): ?>
                <option value="<?php echo $configsDeveloperId ; ?>"><?php echo $configsDeveloper->identifier ; ?></option>
                <?php endforeach; ?>
                </select> <button type="submit" style="width: 100px;">Go &raquo;</button></p>
        </form>
    <?php endif; ?>

<?php endif; ?>

<?php if( $ACTION === NULL ): ?>
<li><a href="?<?php echo http_build_query(['action' => 'deploy']); ?>"
    >Deploy</a></li>
<li><a href="?<?php echo http_build_query(['action' => 'hook']); ?>"
    >Hook</a></li>
<?php endif; ?>

<?php endif; ?>
