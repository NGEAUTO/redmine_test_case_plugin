# Plugin's routes
# See: http://guides.rubyonrails.org/routing.html
get 'rawfile', :to => 'rawfile#index'

match 'rawfile/new',
        :controller => 'rawfile', 
        :action => :new,
        :via => :get
