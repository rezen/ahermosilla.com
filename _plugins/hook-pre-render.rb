UPDATED_THRESHOLD = 5 * (24 * 60 * 60)

Jekyll::Hooks.register :site, :pre_render do |site, payload|
  # Sort pinned posts up!
  # https://talk.jekyllrb.com/t/pinned-posts-like-wordpress/1595/4
  payload['site']['posts'].sort_by!{|p| [p.data['pinned'] ? 1:0, p.date]}.reverse!

  # Iterate through the posts!
  payload['site']['posts'].map!{|p|
    # Add an attribute, post_class, for use in templates
  	classes = [
  		p.data['categories'].map{|c|"category-#{c.downcase}"}.join(" "),
  		p.data['tags'].map{|t|"tag-#{t.downcase}"}.join(" ")
  	]

  	if p.data['pinned']
  		classes.push('is-pinned')
 	  end
  	
    p.data['post_class'] = classes.join('')

    # puts p.data.inspect
    # puts p.inspect

    if (p.source_file_mtime - p.data['date']) > UPDATED_THRESHOLD
      p.data['modified_at'] = p.source_file_mtime
    end

    # Generate an excerpt from the content
    # stripping out liquid tags, urls and code blocks
    # https://coderwall.com/p/r6b4xg/regex-to-match-github-s-markdown-code-blocks
    excerpt = '' + p.content
      # .gsub(/\!\[(^\]+)\]\([^\)]+\)/, '') # ![RDP](/assets/img/windows-10-rdp.png)
      #.gsub(/```[a-z]*\n[\s\S]*?\n```/, '')
      # .gsub(/\{\{.+\}\}/, '')
      .sub('{:toc}', '')
      .sub('* TOC', '')
      .gsub(/^[\#]+\s[^\n]+/, '')
      #.gsub(/(?:f|ht)tps?:\/[^\s]+/, '')
      .gsub(/<("[^"]*"|'[^']*'|[^'">])*>/, "")
      # .gsub(/[\[\]\(\)]/, '')

    puts p.content
    p.data['auto_excerpt'] = excerpt.split(' ').slice(0..75).join(' ') +  ' ...'
  	p
  }
end