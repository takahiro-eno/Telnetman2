#!/usr/bin/perl
# 説明   : 逆ポーランド記法で計算する。
# 作成日 : 2015/06/08
# 作成者 : 江野高広

use strict;
use warnings;

use Scalar::Util;

package Reverse_polish_notation;

sub new {
 my $self = $_[0];
 my $reverse_polish_notation = $_[1];
 
 my %parameter_list = (
  'input_string' => $reverse_polish_notation,
  'reverse_polish_notation' => undef,
  'stack' => [],
  'check' => 0
 );
 
 if(defined($reverse_polish_notation) && (length($reverse_polish_notation) > 0)){
  $reverse_polish_notation =~ s/^,//;
  $reverse_polish_notation =~ s/,$//;
  
  my @split_reverse_polish_notation = split(/,/, $reverse_polish_notation);
  $parameter_list{'reverse_polish_notation'} = \@split_reverse_polish_notation;
  
  $parameter_list{'check'} = &Reverse_polish_notation::check($parameter_list{'reverse_polish_notation'});
 }
 
 bless(\%parameter_list, $self);
}


sub set {
 my $self = $_[0];
 my $reverse_polish_notation = $_[1];
 
 $self -> {'input_string'} = $reverse_polish_notation;
 
 $reverse_polish_notation =~ s/^,//;
 $reverse_polish_notation =~ s/,$//;
 
 my @split_reverse_polish_notation = split(/,/, $reverse_polish_notation);
 
 $self -> {'reverse_polish_notation'} = \@split_reverse_polish_notation;
 splice(@{$self -> {'stack'}}, 0);
 
 $self -> {'check'} = &Reverse_polish_notation::check($self -> {'reverse_polish_notation'});
}


# +, -, *, / 以外で数値以外のものが無いか確認する。
sub check {
 my $ref_reverse_polish_notation = $_[0];
 
 foreach my $n (@$ref_reverse_polish_notation){
  if(($n ne '+') && ($n ne '-') && ($n ne '*') && ($n ne '/')){
   unless(&Scalar::Util::looks_like_number($n)){
    return(0);
    last;
   }
  }
 }
 
 return(1);
}


sub calculate {
 my $self = $_[0];
 
 if($self -> {'check'} == 0){
  return($self -> {'input_string'});
 }
 
 foreach my $n (@{$self -> {'reverse_polish_notation'}}){
  if($n eq '+'){
   $self -> plus;
  }
  elsif($n eq '-'){
   $self -> minus;
  }
  elsif($n eq '*'){
   $self -> multiply;
  }
  elsif($n eq '/'){
   $self -> division;
  }
  else{
   push(@{$self -> {'stack'}}, $n);
  }
 }
 
 my $value = pop(@{$self -> {'stack'}});
 
 return($value);
}

sub plus{
 my $self = $_[0];

 my $n2 = pop(@{$self -> {'stack'}});
 my $n1 = pop(@{$self -> {'stack'}});
 
 $n1 += 0;
 $n2 += 0;
 
 push(@{$self -> {'stack'}}, $n1 + $n2);
}

sub minus{
 my $self = $_[0];

 my $n2 = pop(@{$self -> {'stack'}});
 my $n1 = pop(@{$self -> {'stack'}});
 
 $n1 += 0;
 $n2 += 0;
 
 push(@{$self -> {'stack'}}, $n1 - $n2);
}

sub multiply{
 my $self = $_[0];

 my $n2 = pop(@{$self -> {'stack'}});
 my $n1 = pop(@{$self -> {'stack'}});
 
 $n1 += 0;
 $n2 += 0;
 
 push(@{$self -> {'stack'}}, $n1 * $n2);
}

sub division{
 my $self = $_[0];

 my $n2 = pop(@{$self -> {'stack'}});
 my $n1 = pop(@{$self -> {'stack'}});
 
 $n1 += 0;
 $n2 += 0;
 
 if($n2 == 0){
  $n2 = 1;
 }
 
 push(@{$self -> {'stack'}}, $n1 / $n2);
}

1;
