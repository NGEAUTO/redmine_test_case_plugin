# Plugin's routes
# See: http://guides.rubyonrails.org/routing.html
get 'testplan', :to => 'testplan#index'

match 'testplan/new',
        :controller => 'testplan', 
        :action => :new,
        :via => :get

match 'testplan/edit',
        :controller => 'testplan', 
        :action => :edit,
        :via => :get