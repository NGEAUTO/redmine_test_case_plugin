Redmine::Plugin.register :rawfile do
  name 'Rawfile plugin'
  author 'Author name'
  description 'This is a plugin for Redmine'
  version '0.0.1'
  url 'http://example.com/path/to/plugin'
  author_url 'http://example.com/about'

 / permission :rawfile, { :rawfile => [:index, :vote] }, :public => true/
  menu :project_menu, :rawfile, { :controller => 'rawfile', :action => 'index' }, :caption => 'Rawfile', :after => :activity, :param => :project_id
  project_module :rawfile do
    permission :view_rawfile, :rawfile => :index
    permission :vote_rawfile, :rawfile => :vote
  end
end
