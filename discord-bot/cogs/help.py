import discord
from discord.ext import commands


class Help(commands.Cog):
    def __init__(self, bot):
        self.bot = bot

    @commands.command()
    @commands.has_permissions(administrator=True)
    async def help(self, ctx):
        """Help command"""
        help_embed = discord.Embed(
            title="Help",
            description="Here are the available commands:",
            color=discord.Color.blue(),
        )

        for cog in self.bot.cogs:
            commands_list = []
            for command in self.bot.get_cog(cog).get_commands():
                if not command.hidden:
                    commands_list.append(
                        f"`{self.bot.command_prefix}{command.name}`: {command.help}"
                    )

            if commands_list:
                cog_name = cog.lower()
                cog_help = self.bot.get_cog(cog).__doc__ or ""
                help_embed.add_field(
                    name=f"{cog_name.capitalize()} Commands",
                    value=cog_help + "\n".join(commands_list),
                    inline=False,
                )

        await ctx.send(embed=help_embed)


async def setup(bot):
    await bot.add_cog(Help(bot))
