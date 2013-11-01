#!/usr/bin/perl -w

# An exceptionally hacky script that performs the same kind of automatic
# linking of <a> elements that is done for the SVG specifications, based
# on the definitions*.xml files in this directory.
#
# (Warning: regular expression based munging of XML ahead.)

use strict;
use utf8;

binmode(STDOUT, ":utf8");

sub loaddefs {
  readdefs('definitions-SVG11.xml', 'http://www.w3.org/TR/2011/REC-SVG11-20110816/');
  readdefs('definitions-masking.xml', '');
}

sub readfile {
  my $fh;
  my $fn = shift;
  local $/;
  open $fh, $fn;
  binmode $fh, ':utf8';
  my $s = join('', <$fh>);
  return $s;
}

sub dec {
  my $s = shift;
  $s =~ s/\&lt;/</g;
  $s =~ s/\&gt;/>/g;
  $s =~ s/\&apos;/>/g;
  $s =~ s/\&amp;/\&/g;
  return $s;
}

my $htmlfn = $ARGV[0] or die;

my $html = readfile($htmlfn);

my $dfn;
my %dfns;
while ($html =~ /<dfn([^>]*)>(.*?)<\/dfn>/gs) {
  my $attrs = $1;
  my $name = $2;
  if ($attrs =~ /title=(?:"(.*?)"|'(.*?)')/s) {
    $name = $1 || $2;
  }
  $dfns{$name} = 1;
}

my %attributeCategories;
my %elementCategories;
my %elements;
my %properties;
my %interfaces;
my %attributes;
my %terms;
my %commonAttributes;

sub readdefs {
  my $fn = shift;
  my $base = shift;

  my $defs = readfile($fn);

  while ($defs =~ s/<attributecategory\s(.*?)(?:\/>|>(.*?)<\/attributecategory>)//s) {
    my $attrs = $1;
    my $children = $2;

    $attrs =~ /name=['"](.*?)['"]/ or die;
    my $name = $1;

    $attributeCategories{$name} = { };
    $attributeCategories{$name}{attributes} = { };
    $attributeCategories{$name}{attributesOrder} = [];

    if ($attrs =~ /href=['"](.*?)['"]/) {
      $attributeCategories{$name}{href} = "$base$1";
    }

#    if ($attrs =~ /presentationattributes=['"](.*?)['"]/) {
#      my @presattrs = split(/,\s*/, $1);
#      for my $attrName (@presattrs) {
#        $attributeCategories{$name}{attributes}{$attrName} = $properties{$attrName}{href};
#        push(@{$attributeCategories{$name}{attributesOrder}}, $attrName);
#      }
#    }

    if (defined $children) {
      while ($children =~ /<attribute(.*?)\/>/gs) {
        my $children2 = $1;

        $children2 =~ /name=['"](.*?)['"]/ or die;
        my $attrName = $1;

        $children2 =~ /href=['"](.*?)['"]/ or die;
        my $attrHref = $1;

        $attributeCategories{$name}{attributes}{$attrName} = "$base$attrHref";
        push(@{$attributeCategories{$name}{attributesOrder}}, $attrName);

        $attributes{$attrName} = { } unless defined $attributes{$attrName};
        $attributes{$attrName}{""} = "$base$attrHref";
      }
    }
  }

  while ($defs =~ s/<element\s(.*?)(?:\/>|>(.*?)<\/element>)//s) {
    my $attrs = $1;
    my $children = $2;

    $attrs =~ /name=['"](.*?)['"]/ or die;
    my $name = $1;

    $attrs =~ /href=['"](.*?)['"]/ or die;
    my $href = $1;

    $elements{$name} = { } unless defined $elements{$name};
    $elements{$name}{href} = "$base$href";
    $elements{$name}{attributes} = { };

    # next: parse all the info into %elements, then
    # spit it out in elementSummary.

    if ($attrs =~ /contentmodel=['"](.*?)['"]/) {
      $elements{$name}{contentmodel} = $1;
    }

    if ($attrs =~ /elementcategories=['"](.*?)['"]/) {
      $elements{$name}{elementcategories} = [split(/,\s*/, $1)];
    }

    if ($attrs =~ /elements=['"](.*?)['"]/) {
      $elements{$name}{elements} = [split(/,\s*/, $1)];
    }

    if ($attrs =~ /attributecategories=['"](.*?)['"]/) {
      $elements{$name}{attributecategories} = [split(/,\s*/, $1)];
      for my $cat (@{$elements{$name}{attributecategories}}) {
        for my $catattr (keys %{$attributeCategories{$cat}{attributes}}) {
          $elements{$name}{attributes}{$catattr} = $attributeCategories{$cat}{attributes}{$catattr};
        }
      }
    }

    if ($attrs =~ /attributes=['"](.*?)['"]/) {
      $elements{$name}{attributesCommon} = [split(/,\s*/, $1)];
    }

    if ($attrs =~ /interfaces=['"](.*?)['"]/) {
      $elements{$name}{interfaces} = [split(/,\s*/, $1)];
    }

    if (defined $children) {
      $elements{$name}{attributesSpecific} = [];

      if ($children =~ s/<x:contentmodel.*?>(.*?)<\/x:contentmodel>//s) {
        $elements{$name}{contentmodel} = 'custom';
        $elements{$name}{contentmodelcustom} = $1;
      }

      while ($children =~ /<attribute(.*?)\/>/gs) {
        my $children2 = $1;

        $children2 =~ /name=['"](.*?)['"]/ or die;
        my $attrName = $1;

        $children2 =~ /href=['"](.*?)['"]/ or die;
        my $attrHref = "$base$1";

        $elements{$name}{attributes}{$attrName} = "$base$attrHref";

        push(@{$elements{$name}{attributesSpecific}}, $attrName);

        $attributes{$attrName} = { } unless defined $attributes{$attrName};
        $attributes{$attrName}{$name} = $attrHref;
      }
    }
  }

  while ($defs =~ s/<attribute\s+name=['"](.*?)['"]\s+elements=['"](.*?)['"]\s+href=['"](.*?)['"].*?\/>//s) {
    my $attrName = $1;
    my $attrHref = "$base$3";
    my @elements = split(/,\s*/, $2);
    for my $element (@elements) {
      $elements{$element}{attributes}{$attrName} = $attrHref;
    }
    $attributes{$attrName} = { } unless defined $attributes{$attrName};
    $attributes{$attrName}{""} = $attrHref;
  }

  while ($defs =~ s/<attribute\s+name=['"](.*?)['"]\s+href=['"](.*?)['"].*?\/>//s) {
    my $attrName = $1;
    my $attrHref = "$base$2";

    $commonAttributes{$attrName} = $attrHref;
    $attributes{$attrName} = { } unless defined $attributes{$attrName};
    $attributes{$attrName}{""} = $attrHref;
  }

  for my $elementName (keys(%elements)) {
    if (exists $elements{$elementName}{attributesCommon}) {
      for my $attrName (@{$elements{$elementName}{attributesCommon}}) {
        if (exists $commonAttributes{$attrName}) {
          $elements{$elementName}{attributes}{$attrName} = $commonAttributes{$attrName};
        }
      }
    }
  }

  while ($defs =~ s/<elementcategory\s+name=['"](.*?)['"]\s+href=['"](.*?)['"]\s+elements=['"](.*?)['"]\/>//s) {
    my $cat = $1;
    my $href = "$base$2";
    $elementCategories{$cat} = {
      href => $href,
      elements => [split(/,\s*/, $3)]
    };
    $terms{"$cat element"} = $href;
    $terms{"$cat elements"} = $href;
    for my $elementName (@{$elementCategories{$cat}{elements}}) {
      $elements{$elementName}{categories}{$cat} = $href;
    }
  }

  while ($defs =~ s/<property\s+name=['"](.*?)['"]\s+href=['"](.*?)['"]\s*\/>//s) {
    $properties{$1} = {
      href => "$base$2"
    };
  }

  while ($defs =~ s/<interface\s+name=['"](.*?)['"]\s+href=['"](.*?)['"]\s*\/>//s) {
    $interfaces{$1} = {
      href => "$base$2"
    };
    $terms{$1} = "$base$2";
  }

  while ($defs =~ s/<term\s+name=['"](.*?)['"]\s+href=['"](.*?)['"]\s*\/>//s) {
    $terms{$1} = "$base$2"
  }

  while ($defs =~ s/<symbol\s+name=['"](.*?)['"]\s+href=['"](.*?)['"]\s*\/>//s) {
    $terms{"<$1>"} = "$base$2"
  }
}

sub link {
  my $text = dec(shift);
  if ($text =~ /^'([^ \/]*)'$/) {
    my $name = $1;
    if (defined $elements{$name}) {
      return "<a href='$elements{$name}{href}'><code class='element-name'>&lt;$name></code></a>";
    } elsif (defined $attributes{$name}) {
      if (scalar(keys(%{$attributes{$name}})) > 1) {
        print STDERR "ambiguous reference '$name' to attribute; specify 'elementname/$name' instead\n";
        return "<span class='xxx'>$text</span>";
      } else {
        my $href = join('', values(%{$attributes{$name}}));
        return "<a class='attr-name' href='$href'>‘$name‘</a>";
      }
    } elsif (defined $properties{$name}) {
      return "<a class='property' href='$properties{$name}{href}'>‘$name‘</a>";
    }
    print STDERR "unknown element, attribute or property '$1'\n";
    return "<span class='xxx'>$text</span>";
  } elsif ($text =~ /^'([^ \/]*) element'$/) {
    my $name = $1;
    unless (defined $elements{$name}) {
      print STDERR "unknown element '$1'\n";
      return "<span class='xxx'>$text</span>";
    }
    return "<a href='$elements{$name}{href}'><code class='element-name'>&lt;$name></code></a>";
  } elsif ($text =~ /^'([^ \/]*) attribute'$/) {
    my $name = $1;
    unless (defined $attributes{$name}) {
      print STDERR "unknown attribute '$1'\n";
      return "<span class='xxx'>$text</span>";
    }
    if (scalar(keys(%{$attributes{$name}})) > 1) {
      print STDERR "ambiguous reference '$name attribute' to attribute; specify 'elementname/$name' instead\n";
      return "<span class='xxx'>$text</span>";
    } else {
      my $href = join('', values(%{$attributes{$name}}));
      return "<a class='attr-name' data-link-type='maybe' href='$href'>$name</a>";
    }
  } elsif ($text =~ /^'([^ \/]*) property'$/) {
    my $name = $1;
    unless (defined $properties{$name}) {
      print STDERR "unknown element '$1'\n";
      return "<span class='xxx'>$text</span>";
    }
    return "<a class='property' href='$properties{$name}{href}' data-link-type='propdesc' title='$name'>$name</a>";
  } elsif ($text =~ /^'([^ ]*)\/([^ ]*)'$/) {
    my $eltname = $1;
    my $attrname = $2;
    unless (defined $elements{$eltname} && defined $elements{$eltname}{attributes}{$attrname}) {
      print STDERR "unknown attribute '$attrname' on element '$eltname'\n";
      return "<span class='xxx'>$text</span>";
    }
    return "<a class='attr-name' data-link-type='maybe' href='$elements{$eltname}{attributes}{$attrname}'>$attrname</a>";
  } elsif ($text =~ /^<(.*)>$/) {
    my $symname = $1;
    unless (defined $terms{"<$symname>"}) {
      print STDERR "unknown grammar symbol <$symname>\n";
      return "<span class='xxx'>&lt;$symname&gt;</span>";
    }
    my $href = $terms{"<$symname>"};
    return "<a href='$href'>&lt;$symname&gt;</a>";
  } else {
    $text =~ s/^\s+//;
    $text =~ s/\s+$//;
    $text =~ s/\s/ /gs;
    unless (defined $terms{$text}) {
      print STDERR "unknown term '$text'\n";
      return "<span class='xxx'>$text</span>";
    }
    return "<a href='$terms{$text}'>$text</a>";
  }
}

sub elementSummary {
  my $name = shift;
  my $lcname = lc $name;
  unless (defined $elements{$name}) {
    return "<p class='xxx'>[element summary table for '$name']</p>";
    print STDERR "unknown element '$name'";
  }

  my $cats = join(', ', map { "<a href='$elementCategories{$_}{href}'>$_ element</a>" }
                        sort keys(%{$elements{$name}{categories}}));
  if ($cats eq '') {
    $cats = 'None.';
  } else {
    $cats =~ s/^([^>]*>)([a-z])/$1\U$2/;
  }

  my $model = 'Empty.';
  if (defined $elements{$name}{contentmodel}) {
    my $list = 0;
    if ($elements{$name}{contentmodel} eq 'anyof') {
      $model = 'Any number of the following elements, in any order: ';
      $list = 1;
    } elsif ($elements{$name}{contentmodel} eq 'oneormoreof') {
      $model = 'One or more of the following elements, in any order: ';
      $list = 1;
    } elsif ($elements{$name}{contentmodel} eq 'textoranyof') {
      $model = 'Any number of the following elements or character data, in any order: ';
      $list = 1;
    } elsif ($elements{$name}{contentmodel} eq 'any') {
      $model = 'Any elements or character data.';
    } elsif ($elements{$name}{contentmodel} eq 'text') {
      $model = 'Character data.';
    } elsif ($elements{$name}{contentmodel} eq 'custom') {
      $model = $elements{$name}{contentmodelcustom};
      $model =~ s{<a>(.*?)<\/a>}{&link($1)}egs;
    }
    if ($list) {
      $model .= '<ul class=no-bullets>';
      for my $cat (@{$elements{$name}{elementcategories}}) {
        $model .= "<li><a href='$elementCategories{$cat}{href}'>$cat</a> <span class=expanding> — ";
        $model .= join(', ', map { "<a href='$elements{$_}{href}'><span class=element-name>&lt;$_></span></a>" }
                             @{$elementCategories{$cat}{elements}});
        $model .= '</span></li>';
      }
      for my $elementName (@{$elements{$name}{elements}}) {
        $model .= "<li><a href='$elements{$elementName}{href}'><span class=element-name>&lt;$elementName></span></a></li>";
      }
      $model .= '</ul>';
    }
  }

  my $attributes = '';
  if (defined $elements{$name}{attributecategories}) {
    my @others;
    for my $cat (@{$elements{$name}{attributecategories}}) {
      if ($cat eq 'presentation') {
        $attributes .= "<li><a href='$attributeCategories{$cat}{href}'>$cat attributes</a><span class=expanding> — ";
        $attributes .= join(', ', map { "<a href='$properties{$_}{href}'>‘<code class=property>$_</code>’</a>" }
                            sort keys(%properties));
        $attributes .= '</span></li>';
      } elsif (defined $attributeCategories{$cat}{href}) {
        $attributes .= "<li><a href='$attributeCategories{$cat}{href}'>$cat attributes</a><span class=expanding> — ";
        $attributes .= join(', ', map { "<a href='$elements{$name}{attributes}{$_}'><span class=attr-name>‘$_’</span></a>" }
                            @{$attributeCategories{$cat}{attributesOrder}});
        $attributes .= '</span></li>';
      } else {
        @others = @{$attributeCategories{$cat}{attributesOrder}};
      }
    }
    for my $attr (@others) {
      $attributes .= "<li><a href='$elements{$name}{attributes}{$attr}'><span class=attr-name>‘$attr’</span></a></li>";
    }
    for my $attr (@{$elements{$name}{attributesCommon}}) {
      my $href = $elements{$name}{attributes}{$attr} || $commonAttributes{$attr};
      $attributes .= "<li><a href='$href'><span class=attr-name>‘$attr’</span></a></li>";
    }
    for my $attr (@{$elements{$name}{attributesSpecific}}) {
      $attributes .= "<li><a href='$elements{$name}{attributes}{$attr}'><span class=attr-name>‘$attr’</span></a></li>";
    }
  }
  if ($attributes eq '') {
    $attributes = 'None.';
  } else {
    $attributes = "<ul class=no-bullets>$attributes</ul>";
  }

  my $interfaces;
  if (defined $elements{$name}{interfaces}) {
    $interfaces = join(', ', map { "<a class=idlinterface href='$interfaces{$_}{href}'>$_</a>" }
                             @{$elements{$name}{interfaces}});
  } else {
    $interfaces = 'None.';
  }

  return <<EOF;
<table class="definition-table">
  <tr>
    <th>Name:</th>
    <td><dfn element>$name</dfn>
  </tr>
  <tr>
    <th>Categories:</th>
    <td>$cats</td>
  </tr>
  <tr>
    <th>Content model:</th>
    <td>$model</td>
  </tr>
  <tr>
    <th>Attributes:</th>
    <td>$attributes</td>
  </tr>
  <tr>
    <th>DOM Interfaces:</th>
    <td>$interfaces</td>
  </tr>
</table>
EOF
}

loaddefs();

$html =~ s{<a>(.*?)<\/a>}{&link($1)}egs;
$html =~ s{<!--elementsummary ([^-]+)-->}{&elementSummary($1)}egs;

print $html;
