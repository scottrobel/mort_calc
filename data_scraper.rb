# frozen_string_literal: true

require 'pry'
require 'httparty'
class MortalityData
  include HTTParty
  ContCodes = %w[AUS FIN LVA SVN AUT FRATNP LTU ESP BLR DEUTNP LUX SWE BEL GRC NLD CHE BGR HKG NZL_NP TWN CAN HUN NOR GBR_NP CHL ISL POL USA HRV IRL PRT UKR CZE ISR KOR DNK ITA RUS EST JPN SVK].freeze
  SexInit = %w[m f].freeze
  base_uri 'https://www.mortality.org'
  def initialize(cookie)
    @headers = {
      'Authorization' => cookie
    }
  end

  def all_data
    ContCodes.map do |country_code|
      country_hash = SexInit.map do |gender_init|
        gender = gender_inital_to_gender(gender_init)
        print "#{gender} #{country_code}\n"
        age_mort_hash = get_data_from_year(country_code, gender_init)
        [gender, age_mort_hash]
      end.to_h
      [country_code, country_hash]
    end.to_h
  end

  def gender_inital_to_gender(gender_init)
    gender_init == 'm' ? 'male' : 'female'
  end

  def three_d_array_from(country_code, gender_init)
    data = countries_data(country_code, gender_init)
    three_d_array(data)
  end

  def get_data_from_year(country_code, gender_init, year = nil)
    binding.pry if country_code == 'FRA'
    data = three_d_array_from(country_code, gender_init)[3..-1].transpose
    year_column_array = data[1]
    year = largest_year(year_column_array) if year.nil?
    year_range = index_range_of_year(year_column_array, year)
    data_array = data[3][year_range]
  end

  def index_range_of_year(year_column_array, year)
    start_index = year_column_array.index(year.to_s)
    next_year = year + 1
    last_row_index = year_column_array.size
    end_index = (year_column_array.index(next_year.to_s) || last_row_index) - 1
    (start_index..end_index)
  end

  def largest_year(year_column_array)
    int_array = year_column_array.map(&:to_i)
    int_array.max
  end

  def map_columns_in_rows(rows)
    rows.map do |row|
      row.split(/\s+/)
    end
  end

  def get_rows(data)
    data.split(/\n/)
  end

  def three_d_array(data)
    rows = get_rows(data)
    map_columns_in_rows(rows)
  end

  def countries_data_url(country_code, gender_init)
    "/hmd/#{country_code}/STATS/#{gender_init}ltper_1x1.txt"
  end

  def countries_data(country_code, gender_init)
    url = countries_data_url(country_code, gender_init)
    self.class.get(url, headers: @headers)
  end
end

all_data = MortalityData.new('Basic c2NvdHQucm9iZWwuanJAZ21haWwuY29tOjFtY2tlbm5h').all_data
json_data = all_data.to_json
File.open('./mortality_data.json', 'w+') do |file|
  file.puts(json_data)
end
