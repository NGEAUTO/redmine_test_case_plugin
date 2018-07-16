class TestplanController < ApplicationController
  unloadable


  def index
    @project = Project.find(params[:project_id])
  end

  def edit
    @project = Project.find(params[:project_id])
  end

  def new
    /@project = Project.find(params[:project_id])/
  end

  def delete
    /@project = Project.find(params[:project_id])/
  end

  def show
    /@project = Project.find(params[:project_id])/
  end
end
