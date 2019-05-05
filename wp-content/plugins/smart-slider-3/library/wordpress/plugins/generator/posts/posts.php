<?php

if (N2Platform::$isWordpress) {
    N2Loader::import('libraries.plugins.N2SliderGeneratorPluginAbstract', 'smartslider');

    class N2SSPluginGeneratorPosts extends N2SliderGeneratorPluginAbstract {

        protected $name = 'posts';

        public function getLabel() {
            return n2_('Posts');
        }

        protected function loadSources() {

            new N2GeneratorPostsPosts($this, 'posts', n2_('Posts by filter'));

            new N2GeneratorPostsPostsByIDs($this, 'postsbyids', n2_('Posts by IDs'));
        }

        public function getPath() {
            return dirname(__FILE__) . DIRECTORY_SEPARATOR;
        }
    }

    N2SSGeneratorFactory::addGenerator(new N2SSPluginGeneratorPosts);
}