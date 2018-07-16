class RawfileController < ApplicationController
  unloadable


  def index
  	@project = Project.find(params[:project_id])
  end

  def new
  	/@project = Project.find(params[:project_id])/
  end

  def edit
  end
end
