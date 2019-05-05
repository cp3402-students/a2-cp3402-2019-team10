<?php

require_once 'utilities.php';

use \cp3402\Configurations;

$MENU = [
    'work' => '<a href="?">Work</a>',
];

try{
    /** @var Configurations $CONFIGURATIONS */
    $CONFIGURATIONS = Configurations::openIni('configurations.ini');
}catch( Exception $exception ){
?>
<h1>Error</h1>
<p><?php echo htmlspecialchars($exception->getMessage()); ?></p>
<pre>
<?php $CONFIGURATIONS->flush(); ?>
</pre>
<?php
    goto MAIN;
}
if( isset($_GET['action']) ):
    switch( $_GET['action'] ):
        case 'hook':
?>

<?php
            break;
        case 'deploy':
?>
<h1><?php echo $MENU['work']; ?> / <a href="?<?php echo http_build_query(['action' => 'deploy']); ?>">Deploy</a></h1>
<form method="post" action="?<?php echo http_build_query(['action' => 'deploy']); ?>">
    <?php
    if( isset($_POST['developer_id']) ):
        $developerId = (int)$_POST['developer_id'];
        $developer = $CONFIGURATIONS->developers[$developerId];
        $developerRootPath = &$_POST['root_path'];
        if( !is_string($developerRootPath) || !strlen($developerRootPath) ){
            $developerRootPath = $developer->rootPath;
        }
        $developerMysqlPath = &$_POST['mysql_path'];
        if( !is_string($developerMysqlPath) || !strlen($developerMysqlPath) ){
            $developerMysqlPath = $developer->mysqlPath;
        }
        $developerGitPath = &$_POST['git_path'];
        if( !is_string($developerGitPath) || !strlen($developerGitPath) ){
            $developerGitPath = $developer->gitPath;
        }
        $tool = &$_POST['tool'];
    ?>
    <input type="hidden" name="developer_id" value="<?php echo $developerId ; ?>"/>
    <p><b>Developer:</b> <i><?php echo htmlspecialchars($developer->identifier); ?></i></p>
    <p><b>Root Path:</b><br/>
        <input type="text" name="root_path" value="<?php echo $developerRootPath; ?>"<?php if( $tool !== NULL ) echo ' disabled="disabled"'; ?>/></p>
    <p><b>MySQL Path:</b><br/>
        <input type="text" name="mysql_path" value="<?php echo $developerMysqlPath; ?>"<?php if( $tool !== NULL ) echo ' disabled="disabled"'; ?>/></p>
    <p><b>Git Path:</b><br/>
        <input type="text" name="git_path" value="<?php echo $developerGitPath; ?>"<?php if( $tool !== NULL ) echo ' disabled="disabled"'; ?>/></p>
    <?php if( $tool === NULL ): ?>
    <p><b>Tool:</b><br/>
        <label for="do_push"><input type="radio" name="tool" value="push" id="do_push"/> Push changes</label><br/>
        <label for="do_pull"><input type="radio" name="tool" value="pull" id="do_pull"/> Pull changes</label><br/>
        <label for="do_exp"><input type="radio" name="tool" value="exp" id="do_exp"/> Export database</label><br/>
        <label for="do_imp"><input type="radio" name="tool" value="imp" id="do_imp"/> Import database</label>
    </p>
    <p><button type="submit">Go</button></p>
    <?php else: ?>
    <pre>
    <?php
        switch( $tool ){
            case 'push':
                $developer->push();
                break;
            case 'pull':
                $developer->pull();
                break;
            case 'exp':
                $developer->database->export();
                break;
            case 'imp':
                $developer->database->import();
                break;
            default:
        }
        $CONFIGURATIONS->flush();
    ?>
    </pre>
<?php endif; ?>
    <?php else: ?>
    <p><select name="developer_id" size="5">
    <?php foreach( $CONFIGURATIONS->developers as $developerId => $developer ): ?>
        <option value="<?php echo $developerId ; ?>"><?php echo $developer->identifier ; ?></option>
    <?php endforeach; ?>
    </select></p>
    <p><button type="submit">Go</button></p>
    <?php endif; ?>
</form>
<?php
            break;
        default:
?>
<p>Unknown action!</p>
<?php
            goto MAIN;
    endswitch;
else:
    MAIN:
?>
<h1><?php echo $MENU['work']; ?></h1>
<li><a href="?<?php echo http_build_query(['action' => 'deploy']); ?>"
    >Deploy</a></li>
<li><a href="?<?php echo http_build_query(['action' => 'hook']); ?>"
    >Hook</a></li>
<?php
endif;
?>
