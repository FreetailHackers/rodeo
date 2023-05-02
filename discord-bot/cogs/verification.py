import discord
from discord.ext import commands
from prisma import Prisma
import re


class VerificationCog(commands.Cog):
    def __init__(self, bot):
        self.bot = bot
        self.db = Prisma()

    @commands.command()
    async def verify(self, ctx):
        """Sends a user a DM prompting them to verify"""
        # Prompt user to send a DM with their email
        await ctx.message.delete()
        user = ctx.author
        await user.send(
            "Please send me a DM with the email address you used for Rodeo."
        )

        while True:
            # Wait for user to send a DM
            def check_dm(message):
                return (
                    isinstance(message.channel, discord.DMChannel)
                    and message.author == ctx.author
                )

            msg = await self.bot.wait_for("message", check=check_dm)

            email = msg.content.strip()
            result = await self.is_valid_email(email)
            if bool(result):
                if result.role == "HACKER" and result.status != "CONFIRMED": 
                    await user.send("You have have either not confirmed your attendance or have not been accepted. Only hackers who have confirmed their attendance can join the server.")
                    return
                
                await user.send(f"Thank you for verifying your email.")
                await user.add_roles(
                    discord.utils.get(user.guild.roles, name="verified")
                )
                
                user_role = str(result.role).title()
                user_role = "admin" if user_role == "Admin" else user_role
                role = discord.utils.get(user.guild.roles, name=user_role)
                if role == None:
                    role = await ctx.guild.create_role(name={user_role})
                    await user.add_roles(
                        discord.utils.get(user.guild.roles, name={user_role})
                    )
                else:
                    await user.add_roles(role)
                return
            await user.send(
                f"Email '{email}' was not used for Rodeo. Please try another one"
            )

    async def is_valid_email(self, email):
        """Returns True if the given string is a valid email address."""
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"  # Email validation regex
        if bool(re.match(pattern, email)):
            await self.db.connect()
            result = await self.db.user.find_unique(where={"email": email})
            await self.db.disconnect()
            return result
        return False


async def setup(bot):
    await bot.add_cog(VerificationCog(bot))
