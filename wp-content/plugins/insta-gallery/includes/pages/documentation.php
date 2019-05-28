<?php
if (!defined('ABSPATH'))
  exit;
?>
<header class="ig-doc-header">
  <h3>
    How to Get Instagram API Credentials: <a href="#TB_inline?&width=920&height=600&inlineId=ig-ahcreds" class="thickbox" style="font-size: 75%;">(i
      already have API credentials)</a>
  </h3>
  <p>
    To fetch Instagram feed you have to pass <strong>access token</strong> to Instagram. And access token can be generated using Instagram API (which
    need to register an Application). So please register Instagram Gallery plugin to access feed, which requires authentication. <strong><a
        href="https://www.instagram.com/developer/" title="Instagram Developer Documentation" target="_blank" rel="noreferrer nofollow noopener">Read More</a></strong>
  </p>
  <p>
    Please follow the below steps carefully to get API Credentials. Let’s go!<br />
  </p>
</header>
<div class="notice notice-info is-dismissible">
  <p>if you are facing any issue while generating access token, then you can take help from <a href="https://www.google.co.in/search?q=how+to+generate+instagram+access+token&amp;ie=UTF-8&amp;oe=UTF-8" title="Google search for Instagram access token" target="_blank" rel="noreferrer nofollow noopener">Internet</a>. there are lots of videos and articles available there.
    <br />e.g. you can generate token from the below sites and can add generated token in the plugin setting.<br />
    https://instagram.pixelunion.net/<br />
    https://webkul.com/blog/create-instagram-access-token/<br />
    https://instagram.themeruby.com/</p>
</div>
<div id="ig-ahcreds" style="display: none;">
  <h4>
    if you already have API credentials and already registerd an Application, but <strong>access token</strong> is not generated,<br /> then you can use
    same credentials by following the simple steps below:
  </h4>
  <ol>
    <li>Login to <a href="https://www.instagram.com/developer/" target="_blank" rel="noreferrer nofollow noopener">Instagram developer web page</a></li>
    <li>go to <strong>Manage Clients</strong> section.
    </li>
    <li>click <strong>Manage</strong> button within specific client.
    </li>
    <li>click <strong>Security</strong> tab within the opened client.
    </li>
    <li>and add the below <strong>redirect URI</strong> within the <strong>Valid redirect URIs:</strong> field.
    </li>
  </ol>
  <p>
    <label ><strong>Redirect URI</strong>: <input type="url" onclick="select();document.execCommand('copy');alert('copied');" title="click to copy" value="<?php echo admin_url('admin.php?page=qligg_token&igigresponse=1'); ?>"
                                                  class="ig-doc-red-url" readonly /></label>
  </p>
  <hr />
  <figure class="ig-doc-figure">
    <img src="<?php echo plugins_url('/assets/img/ig-hdp-p1.png', QLIGG_PLUGIN_FILE); ?>" />
  </figure>
</div>
<div class="ig-doc-body">
  <article>
    <h3>
      <span>Step 1:</span> Sign in Instargam as a developer.
    </h3>
    <p>
      You have to register as a developer in Instagram to receive <b>Client ID</b> and <b>Client Secret</b>. That’s why please follow the link to the <a
        href="https://www.instagram.com/developer/" target="_blank" rel="noreferrer nofollow noopener">Instagram developer web page</a> and Login to your
      account.
    </p>
    <figure>
      <img src="<?php echo plugins_url('/assets/img/ig-hdp-1.png', QLIGG_PLUGIN_FILE); ?>" />
    </figure>
    <p>
      After login click on <strong>Register Your Application</strong> button to continue.
    </p>
    <figure>
      <img src="<?php echo plugins_url('/assets/img/ig-hdp-2.jpg', QLIGG_PLUGIN_FILE); ?>" />
    </figure>
  </article>
  <article>
    <h3>
      <span>Step 2:</span> Fill in the Developer Signup Details.
    </h3>
    <p>Instagram demands to be registered as a developer from everyone, who wants to display Instagram feed on his website. After you log in the next
      window will appear.</p>
    <p>Fill-up all the fields on the web page:</p>
    <table>
      <tr>
        <th>Your website:</th>
        <td>the URL of your website.</td>
      </tr>
      <tr>
        <th>Phone number:</th>
        <td>your phone number.</td>
      </tr>
      <tr>
        <th>What do you want to build with API?</th>
        <td>any short description.</td>
      </tr>
    </table>
    <figure>
      <img src="<?php echo plugins_url('/assets/img/ig-hdp-3.png', QLIGG_PLUGIN_FILE); ?>" />
    </figure>
  </article>
  <article>
    <h3>
      <span>Step 3:</span> Register your Application.
    </h3>
    <p>After Developer signup, Now you can register your Application.</p>
    <figure>
      <img src="<?php echo plugins_url('/assets/img/ig-hdp-4.png', QLIGG_PLUGIN_FILE); ?>" />
    </figure>
    <h3>Register New Client ID</h3>
    <p>Check the fields on the web page:</p>
    <table>
      <tr>
        <th>Application name</th>
        <td>choose any appropriate name, which fits Instagram requirements.</td>
      </tr>
      <tr>
        <th>Description</th>
        <td>any short description.</td>
      </tr>
      <tr>
        <th>Company Name</th>
        <td>company/website name.</td>
      </tr>
      <tr>
        <th>Website URL</th>
        <td>your website url e.g. <strong><?php echo home_url(); ?></strong></td>
      </tr>
      <tr>
        <th>Valid redirect URIs</th>
        <td>have to be <input type="url" onclick="select();document.execCommand('copy');alert('copied');" title="click to copy"
                              value="<?php echo admin_url('admin.php?page=qligg_token&igigresponse=1'); ?>" class="ig-doc-red-url" readonly /><br /> <strong
                              style="color: #e93b59; font-size: 15px; line-height: normal; font-style: italic;">(note that you should set the redirect link exactly the same
            displayed here.)</strong></td>
      </tr>
      <tr>
        <th>Privacy Policy URL</th>
        <td>your website url e.g. <strong><?php echo home_url(); ?></strong></td>
      </tr>
      <tr>
        <th>Contact email</th>
        <td>your email address.</td>
      </tr>
    </table>
    <p>In the "Security" tab, leave the default settings ("Disable implicit OAuth" should be checked & "Enforce signed requests" should be unchecked).</p>

    <figure>
      <img src="<?php echo plugins_url('/assets/img/ig-hdp-5.png', QLIGG_PLUGIN_FILE); ?>" />
    </figure>
    <p>Now confirm the filled details and proceed to the next page. Here you can see Instagram Client ID and Client Secret.</p>
    <figure>
      <img src="<?php echo plugins_url('/assets/img/ig-hdp-6.png', QLIGG_PLUGIN_FILE); ?>" />
    </figure>
    <p>Copy the crendentials and go back to your Instagram Gallery plugin setting page and enter the generated crendentials to get Access Token.</p>
    <figure>
      <img src="<?php echo plugins_url('/assets/img/ig-hdp-7.png', QLIGG_PLUGIN_FILE); ?>" />
    </figure>
  </article>
</div>
<footer> </footer>