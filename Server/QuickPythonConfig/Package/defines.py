# File: defines.py
# Aim: Defines of components, it contains config parser and logger components
# Version: 1.0

# %%
# Imports
import configparser
import logging
import logging.config
import os
import pandas as pd
import traceback

# %%


def beside(name):
    return os.path.join(os.path.dirname(__file__), name)


class Config(object):
    def __init__(self):
        pass

    def reload_logger(self, name, log_filepath='./logfile.log', cfg_path=None):
        # Load logger from config
        # Setup default logging.ini path
        if cfg_path is None:
            cfg_path = beside('logging.ini')

        # Initialize logger
        logging.config.fileConfig(cfg_path,
                                  defaults={'log_filepath': log_filepath})
        logger = logging.getLogger(name)
        self.logger = logger
        self.logger.info(f'Logger initialized as "{name}" using "{cfg_path}"')

    def reload_cfg(self, cfg_path=None):
        # Reload configure parser
        if cfg_path is None:
            # If cfg_path is not specified,
            # generate an empty config parser
            self.parser = configparser.ConfigParser()
            self.parser.read_string('')
            return

        # Load config parser from cfg_path
        parser = configparser.ConfigParser()
        parser.read(cfg_path)
        self.parser = parser
        self.logger.debug(f'Configure of {cfg_path} is used.')

    def peek(self):
        # Restore the configures into a DataFrame,
        # and return it
        # Init DataFrame
        frame = pd.DataFrame()

        # Walk though the configures
        for section in self.parser.sections():
            for option in self.parser[section]:
                # Get value and append
                value = self.get(section, option)
                frame = frame.append(dict(Section=section,
                                          Option=option,
                                          Value=value),
                                     ignore_index=True)

        if len(frame) > 0:
            # Reorder the columns, if the DataFrame is not empty
            frame = frame[['Section', 'Option', 'Value']]
        self.logger.debug(f'Peeked configure, {len(frame)} options are found')
        return frame

    def get(self, section, option, suppress_NonExistError=True):
        # Get [section].[option],
        # interpolate if it is valid,
        # return raw value if it is invalid,
        # return None if it doesn't exist
        # suppress_NoError will suppress the non-exist error from raising
        try:
            # Everything is fine
            value = self.parser.get(section, option)

        except configparser.InterpolationMissingOptionError as err:
            # Can't interploate necessary options
            self.logger.warning(f'Interpolate error: {err}')
            value = self.parser.get(section, option, raw=True)

        except configparser.NoSectionError as err:
            # No section found
            self.logger.error(f'No section error: {err}')
            if not suppress_NonExistError:
                raise err
            return None

        except configparser.NoOptionError as err:
            # No option found
            self.logger.error(f'No option error: {err}')
            if not suppress_NonExistError:
                raise err
            return None

        self.logger.debug(f'Get configure: {section}.{option}: "{value}"')
        return value

    def get_section(self, section, suppress_NoSectionError=True):
        # Get options in [section],
        # generate a dict for output
        output = dict()
        if self.parser.has_section(section):
            # Walk though the [section]
            for option in self.parser[section]:
                # Add new [option]
                value = self.get(section, option)
                output[option] = value
            self.logger.debug(
                f'Get configure: {section}.* for {len(output)} options')

        else:
            # No [section] found
            err = configparser.NoSectionError(section)
            self.logger.error(f'No section error: {err}')
            if not suppress_NoSectionError:
                raise err

        return output

    def set(self, section, option, value):
        # Set [section].[option] = [value],
        # create the key if it doesn't exist
        if section in self.parser:
            # Section exists
            if option in self.parser[section]:
                _value = self.get(section, option)
                self.logger.warning(
                    f'Overwrite configure {section}.{option}: "{_value}" with "{value}"')
        else:
            # Section doesn't exist
            self.parser.add_section(section)
            self.logger.debug(f'New section added: {section}')
        self.parser.set(section, option, value)
        self.logger.info(f'Set configure: {section}.{option}: "{value}"')

    def reset(self, section, option):
        # Reset [section].[option] as empty string '',
        # do nothing if it doesn't exist
        try:
            self.parser.set(section, option, '')
            self.logger.debug(f'Reset configure: {section}.{option}')
        except configparser.NoSectionError as err:
            self.logger.warning(
                f'Failed to reset {section}.{option}, since the section is not defined')


# %%
