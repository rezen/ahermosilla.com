module Jekyll
  module UrlizeFilter
    def urlize(input)
    	"<a rel=\"external\" href=\"#{input}\">#{input}</a>"
    end
  end
end

Liquid::Template.register_filter(Jekyll::UrlizeFilter)