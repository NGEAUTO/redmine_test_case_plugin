Redmine::Plugin.register :testplan do
  name 'Testplan plugin'
  author 'Author name'
  description 'This is a plugin for Redmine'
  version '0.0.1'
  url 'http://example.com/path/to/plugin'
  author_url 'http://example.com/about'

/permission :testplan, { :testplan => [:edit, :new] }, :public => true/
  menu :project_menu, :testplan, { :controller => 'testplan', :action => 'edit' }, :caption => 'Testplan', :after => :activity, :param => :project_id
  project_module :testplan do
    permission :view_testplan, :testplan => :edit
  end

end
