<?php

/**
 * JCU CNS 2019 SP1 CP3402 A2 Team 10.
 * @author Yvan Burrie
 */

require_once 'utilities.php';

use \cp3402\Configurations;

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
$ACTION = &$_GET['action'];
switch( $ACTION ){
    case 'hook':
        if( FALSE === $CONFIGURATIONS->handleHook($_POST) ){
            $ERROR = [
                'Hook Error',
                'Invalid hook triggered.',
            ];
        }
        break;
    case 'deploy':
        $MENU[] = '<a href="?' . http_build_query(['action' => 'deploy']) .'">Deploy</a>';
        $developerId = &$_GET['dev'];
        if( $developerId !== NULL ){
            $developer = $CONFIGURATIONS->developers[$developerId];
            $MENU[] = '<a href="?' . http_build_query(['action' => 'deploy', 'dev' => $developerId]) .'">' . htmlspecialchars($developer->identifier) . '</a>';
            $developerRootPath = &$_POST['root_path'];
            if( !is_string($developerRootPath) ||
                !strlen($developerRootPath) ){
                $developerRootPath = implode(DIRECTORY_SEPARATOR, $developer->rootPath);
            }
            $developerMysqlPath = &$_POST['mysql_path'];
            if( !is_string($developerMysqlPath) ||
                !strlen($developerMysqlPath) ){
                $developerMysqlPath = implode(DIRECTORY_SEPARATOR, $developer->mysqlPath);
            }
            $developerGitPath = &$_POST['git_path'];
            if( !is_string($developerGitPath) ||
                !strlen($developerGitPath) ){
                $developerGitPath = implode(DIRECTORY_SEPARATOR, $developer->gitPath);
            }
            $tool = &$_POST['tool'];
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
                case 'wp_host':
                    $developer->database->modifyWpHost();
                    break;
            }
        }else{
            $developer = NULL;
        }
        break;
    case NULL:
        break;
    default:
        $ERROR = [
            'Unknown Action',
            'The requested action is not known.',
        ];
        break;
}
?>

<?php if( $ERROR ): ?>

<h1><?php echo htmlspecialchars($ERROR[0]); ?></h1>
<p><?php echo htmlspecialchars($ERROR[1]); ?></p>
<pre><?php $CONFIGURATIONS->flush(); ?></pre>

<?php else: ?>

<h1><?php echo implode(' / ', $MENU); ?></h1>

    <?php if( $ACTION == 'deploy'): ?>

        <?php if( $developer ): ?>
<form method="post" action="?<?php echo http_build_query(['action' => 'deploy', 'dev' => $developerId]); ?>">
    <p><b>Root Path:</b><br/>
        <input type="text" name="root_path" value="<?php echo $developerRootPath; ?>"<?php if( $tool ): ?> disabled="disabled"<?php endif; ?>/></p>
    <p><b>MySQL Path:</b><br/>
        <input type="text" name="mysql_path" value="<?php echo $developerMysqlPath; ?>"<?php if( $tool ): ?> disabled="disabled"<?php endif; ?>/></p>
    <p><b>Git Path:</b><br/>
        <input type="text" name="git_path" value="<?php echo $developerGitPath; ?>"<?php if( $tool ): ?> disabled="disabled"<?php endif; ?>/></p>
            <?php if( $tool ): ?>
    <pre><?php $CONFIGURATIONS->flush(); ?></pre>
            <?php else: ?>
    <p><b>Tool:</b><br/>
        <label for="do_push"><input type="radio" name="tool" value="push" id="do_push"/> Push changes</label>
        <br/>
        <label for="do_pull"><input type="radio" name="tool" value="pull" id="do_pull"/> Pull changes</label>
        <br/>
        <label for="do_exp"><input type="radio" name="tool" value="exp" id="do_exp"/> Export database</label>
        <br/>
        <label for="do_imp"><input type="radio" name="tool" value="imp" id="do_imp"/> Import database</label>
        <br/>
        <label for="do_wp_host"><input type="radio" name="tool" value="wp_host" id="do_wp_host"/> Modify WP host</label>
    </p>
    <p><button type="submit">Execute &raquo;</button></p>
            <?php endif; ?>
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

    <?php if( $ACTION === NULL): ?>
<li><a href="?<?php echo http_build_query(['action' => 'deploy']); ?>"
    >Deploy</a></li>
<li><a href="?<?php echo http_build_query(['action' => 'hook']); ?>"
    >Hook</a></li>
    <?php endif; ?>

<?php endif; ?>
